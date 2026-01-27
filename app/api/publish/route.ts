import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { adminClient } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = (session.user as any)?.role === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { submissionId } = await request.json()

    // Fetch the submission
    const submission = await adminClient.fetch(
      `*[_type == "submission" && _id == $id][0] {
        _id,
        title,
        slug,
        category,
        excerpt,
        bodyHtml,
        mainImage,
        author,
        status,
        publishedPostId
      }`,
      { id: submissionId }
    )

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Idempotency check: if already published or has an associated post ID
    if (submission.status === "published" && submission.publishedPostId) {
      // Fetch and return existing post to be helpful
      const existingPost = await adminClient.fetch(`*[_id == $id][0]`, { id: submission.publishedPostId })
      if (existingPost) {
        return NextResponse.json({ success: true, post: existingPost, alreadyPublished: true })
      }
    }

    // Use a deterministic ID for the post document
    // We strip 'drafts.' if it's there to ensure the post ID is clean
    const deterministicPostId = `post-${submissionId.replace('drafts.', '')}`

    // Create or Update the post document (idempotent)
    const postData = {
      _type: "post",
      title: submission.title,
      slug: submission.slug,
      category: submission.category,
      excerpt: submission.excerpt,
      bodyHtml: submission.bodyHtml,
      mainImage: submission.mainImage,
      author: submission.author,
      publishedAt: new Date().toISOString(),
      viewCount: 0,
      likes: 0,
      commentCount: 0,
    }

    const post = await adminClient.createIfNotExists({
      _id: deterministicPostId,
      ...postData
    })

    // If it already existed but wasn't synced for some reason, we update it
    if (post._id === deterministicPostId) {
      await adminClient.patch(deterministicPostId).set(postData).commit()
    }

    // Update submission status to published and link the post ID
    await adminClient
      .patch(submissionId)
      .set({ status: "published", publishedPostId: post._id })
      .commit()

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Error publishing submission:", error)
    return NextResponse.json({ error: "Failed to publish submission" }, { status: 500 })
  }
}
