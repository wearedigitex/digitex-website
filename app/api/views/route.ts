import { NextRequest, NextResponse } from "next/server"
import { incrementViewCount } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 })
    }

    await incrementViewCount(postId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 })
  }
}
