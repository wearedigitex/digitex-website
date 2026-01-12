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
        author
      }`,
      { id: submissionId }
    )

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Create a post document
    const post = await adminClient.create({
      _type: "post",
      title: submission.title,
      slug: submission.slug,
      category: submission.category,
      excerpt: submission.excerpt,
      bodyHtml: submission.bodyHtml,
      mainImage: submission.mainImage,
      author: submission.author,
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      commentCount: 0,
    })

    // Update submission status to published
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
