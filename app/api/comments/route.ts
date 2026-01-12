import { NextRequest, NextResponse } from "next/server"
import { adminClient, client } from "@/lib/sanity"
import { revalidatePath } from "next/cache"

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
    const { postId, name, email, comment, verificationCode, parentCommentId } = await request.json()

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

    // Check if commenter is using a team member's email (User schema)
    const userMatch = await adminClient.fetch(
      `*[_type == "user" && email == $email][0] { _id, verificationCode }`,
      { email }
    )

    let isTeamMember = false
    let isApproved = false // Default to false for moderation

    if (userMatch) {
      // It's a team member's email. Check verification code.
      if (userMatch.verificationCode) {
         if (verificationCode && verificationCode === userMatch.verificationCode) {
            // Verified!
            isTeamMember = true
            isApproved = true // Auto-approve verified team members
         } else {
            return NextResponse.json(
              { error: "This email is reserved for verified team members. Please enter the correct Team Code." },
              { status: 403 }
            )
         }
      }
    }

    const doc: any = {
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: postId,
      },
      name,
      email,
      comment,
      approved: isApproved, 
      autoApproved: isApproved,
      isTeamMember,
      createdAt: new Date().toISOString(),
    }

    if (parentCommentId) {
        doc.parentComment = {
            _type: 'reference',
            _ref: parentCommentId
        }
    }

    const createdComment = await adminClient.create(doc)

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
  } catch (error) {
    console.error("Error submitting comment:", error)
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 })
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
      const { commentId, email } = await request.json()
  
      if (!commentId || !email) {
        return NextResponse.json({ error: "Comment ID and email are required" }, { status: 400 })
      }
  
      // Fetch comment to verify email
      const comment = await adminClient.fetch(`*[_type == "comment" && _id == $commentId][0]`, { commentId })
  
      if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 })
      }
  
      // Verify email matches
      if (comment.email !== email) {
        return NextResponse.json({ error: "Unauthorized: Email does not match comment author" }, { status: 403 })
      }

      // Check if user is actually a team member (extra security)
      // This ensures only the team member who made the comment can delete it, or potentially we could allow admins to delete any.
      // For now, we stick to the user verification of email.
  
      // Fetch all comments for this post to find descendants
      const allComments = await adminClient.fetch(`*[_type == "comment" && post._ref == $postId]`, { 
        postId: comment.post?._ref 
      })
  
      // Find all descendant IDs recursively
      const getDescendants = (parentId: string): string[] => {
        const children = allComments.filter((c: any) => c.parentComment?._ref === parentId)
        return children.reduce((acc: string[], child: any) => {
          return [...acc, child._id, ...getDescendants(child._id)]
        }, [])
      }
  
      const idsToDelete = [commentId, ...getDescendants(commentId)]
  
      // Delete all comments in the thread
      const transaction = adminClient.transaction()
      idsToDelete.forEach(id => transaction.delete(id))
      
      // Count all approved comments to delete (to decrement count correctly)
      const approvedToDeleteCount = allComments
        .filter((c: any) => idsToDelete.includes(c._id) && c.approved === true)
        .length
  
      // Decrement comment count on post by the number of APPROVED deleted comments
      if (comment.post?._ref && approvedToDeleteCount > 0) {
        transaction.patch(comment.post._ref, p => 
          p.setIfMissing({ commentCount: 0 })
           .dec({ commentCount: approvedToDeleteCount })
        )
      }
  
      await transaction.commit()
      
      // Revalidation
      if (comment.post?._ref) {
         revalidatePath("/blog")
          const post = await client.fetch(`*[_id == $postId][0] { "slug": slug.current }`, { postId: comment.post._ref })
          if (post?.slug) {
            revalidatePath(`/blog/${post.slug}`)
          }
      }
  
      return NextResponse.json({ 
        success: true,
        message: "Comment thread deleted successfully",
        deletedCount: idsToDelete.length 
      })
    } catch (error: any) {
      console.error("Error deleting comment:", error)
      return NextResponse.json({ error: `Error deleting comment: ${error.message}` }, { status: 500 })
    }
  }
