import { NextRequest, NextResponse } from "next/server"
import { adminClient, client } from "@/lib/sanity"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

// Rate limiting storage (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit (3 comments per hour)
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    })
    return true
  }

  if (limit.count >= 3) {
    return false // Rate limit exceeded
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { postId, name, email, comment, parentCommentId } = await request.json()

    if (!postId || !name || !email || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Rate limiting by email
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before posting again." },
        { status: 429 }
      )
    }

    // Check for active session for team member verification
    const session = await auth()
    const sessionEmail = session?.user?.email?.toLowerCase()

    let isTeamMember = false
    let isApproved = false
    let teamTitle = undefined

    if (sessionEmail && sessionEmail === email.toLowerCase()) {
      // User is logged in and the email matches. Check if they are a team member.
      const userMatch = await adminClient.fetch(
        `*[_type == "user" && email == $email][0] { 
          _id,
          "author": author-> {
            name,
            role,
            "department": department->name
          }
        }`,
        { email: sessionEmail }
      )

      if (userMatch?.author) {
        isTeamMember = true
        isApproved = true // Auto-approve logged-in team members

        // Determine the badge title
        if (userMatch.author.role === "President") {
          teamTitle = "President"
        } else if (userMatch.author.department) {
          teamTitle = `${userMatch.author.department} Department`
        } else {
          teamTitle = "Team Member"
        }
      }
    }

    const commentDoc = {
      _type: 'comment',
      name,
      email,
      comment,
      post: {
        _type: 'reference',
        _ref: postId,
      },
      parentComment: parentCommentId ? {
        _type: 'reference',
        _ref: parentCommentId,
      } : undefined,
      approved: isApproved,
      isTeamMember,
      autoApproved: isApproved, // Mark as counted if auto-approved
      teamTitle,
      createdAt: new Date().toISOString(),
    }

    const createdComment = await adminClient.create(commentDoc)

    // Increment comment count on post ONLY if approved
    if (isApproved) {
      await adminClient
        .patch(postId)
        .setIfMissing({ commentCount: 0 })
        .inc({ commentCount: 1 })
        .commit()
    }

    // Revalidation
    revalidatePath("/blog")
    const post = await client.fetch(`*[_id == $postId][0] { "slug": slug.current }`, { postId })
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`)
    }

    return NextResponse.json({ success: true, message: "Comment submitted", approved: isApproved, isTeamMember, comment: createdComment })
  } catch (error: any) {
    console.error("Error submitting comment:", error)
    return NextResponse.json({ error: `Failed to submit comment: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 })
  }

  try {
    const comments = await adminClient.fetch(
      `*[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt desc) {
        _id,
        name,
        comment,
        createdAt,
        isTeamMember,
        teamTitle,
        "parentCommentId": parentComment._ref
      }`,
      { postId }
    )
    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { commentId, email, reason } = await request.json()

    if (!commentId || !email) {
      return NextResponse.json({ error: "Comment ID and email are required" }, { status: 400 })
    }

    // Fetch comment and post details
    const comment = await adminClient.fetch(
      `*[_type == "comment" && _id == $commentId][0] {
      _id,
      email,
      comment,
      isTeamMember,
      post { _ref }
    }`,
      { commentId }
    )

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Verify email matches
    if (comment.email !== email) {
      return NextResponse.json({ error: "Unauthorized: Email does not match comment author" }, { status: 403 })
    }

    // Check if session belongs to a team member
    const session = await auth()
    const sessionEmail = session?.user?.email?.toLowerCase()
    const isAdmin = (session?.user as any)?.role === "admin"

    // INSTANT DELETION FOR LOGGED-IN TEAM MEMBERS (owner or admin)
    if (sessionEmail && (sessionEmail === email.toLowerCase() || isAdmin)) {
      // Check if the user is actually a team member (has an author profile)
      const userMatch = await adminClient.fetch(
        `*[_type == "user" && email == $email][0] { _id, author }`,
        { email: sessionEmail }
      )

      if (userMatch?.author || isAdmin) {
        // Verified team member! Delete immediately.

        // Fetch all comments for this post to find descendants
        const allComments = await adminClient.fetch(`*[_type == "comment" && post._ref == $postId]`, {
          postId: comment.post?._ref
        })

        const getDescendants = (parentId: string): string[] => {
          const children = allComments.filter((c: any) => c.parentComment?._ref === parentId)
          return children.reduce((acc: string[], child: any) => {
            return [...acc, child._id, ...getDescendants(child._id)]
          }, [])
        }

        const idsToDelete = [commentId, ...getDescendants(commentId)]

        const transaction = adminClient.transaction()
        idsToDelete.forEach(id => transaction.delete(id))

        const approvedToDeleteCount = allComments
          .filter((c: any) => idsToDelete.includes(c._id) && c.autoApproved === true)
          .length

        if (comment.post?._ref && approvedToDeleteCount > 0) {
          transaction.patch(comment.post._ref, p =>
            p.setIfMissing({ commentCount: 0 })
              .dec({ commentCount: approvedToDeleteCount })
          )
        }

        await transaction.commit()

        if (comment.post?._ref) {
          revalidatePath("/blog")
          const post = await client.fetch(`*[_id == $postId][0] { "slug": slug.current }`, { postId: comment.post._ref })
          if (post?.slug) {
            revalidatePath(`/blog/${post.slug}`)
          }
        }

        return NextResponse.json({
          success: true,
          instantlyDeleted: true,
          message: "Comment thread deleted successfully",
        })
      }
    }

    // VISITOR DELETION REQUEST FLOW
    // Create a deletion request in Sanity
    await adminClient.create({
      _type: 'deleteRequest',
      comment: {
        _type: 'reference',
        _ref: commentId,
      },
      commentContent: comment.comment,
      requesterEmail: email,
      reason: reason || 'Requested by author',
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      instantlyDeleted: false,
      message: "Your deletion request has been sent to our moderators for approval. The comment will be removed once approved."
    })

  } catch (error: any) {
    console.error("Error handling deletion:", error)
    return NextResponse.json({ error: `Error processing deletion: ${error.message}` }, { status: 500 })
  }
}
