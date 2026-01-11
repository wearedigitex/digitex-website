import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const { postId, name, email, comment } = await request.json()

    if (!postId || !name || !email || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const doc = {
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: postId,
      },
      name,
      email,
      comment,
      approved: false, // Default to false for moderation
      createdAt: new Date().toISOString(),
    }

    await adminClient.create(doc)

    return NextResponse.json({ success: true, message: "Comment submitted for moderation" })
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
      `*[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt desc)`,
      { postId }
    )
    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
