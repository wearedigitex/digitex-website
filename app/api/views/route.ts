import { NextRequest, NextResponse } from "next/server"
import { incrementViewCount } from "@/lib/sanity"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 })
    }

    // Check for view cookie
    const cookieStore = await cookies()
    const viewCookie = cookieStore.get(`viewed_${postId}`)

    if (viewCookie) {
      // User has already viewed this article recently
      return NextResponse.json({ success: true, message: "View already counted recently" })
    }

    await incrementViewCount(postId)

    // Set cookie to prevent multiple views (24 hours expiry)
    cookieStore.set(`viewed_${postId}`, "true", {
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 })
  }
}
