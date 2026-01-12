
import { NextRequest, NextResponse } from "next/server"
import { updateLikeCount } from "@/lib/sanity"

export async function PATCH(request: NextRequest) {
  try {
    const { postId, increment } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 })
    }

    const data = await updateLikeCount(postId, increment)

    return NextResponse.json({ likes: data.likes })
  } catch (error) {
    console.error("Error updating likes:", error)
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 })
  }
}
