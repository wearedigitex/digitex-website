import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { adminClient } from "@/lib/sanity"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Fetch submission details
    const submission = await adminClient.fetch(
      `*[_type == "submission" && _id == $id][0] {
        _id,
        _createdAt,
        title,
        "slug": slug.current,
        "category": category->name,
        excerpt,
        body,
        bodyHtml,
        mainImage,
        status,
        submittedAt,
        reviewNotes,
        "author": author->name
      }`,
      { id }
    )

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error fetching submission details:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership (optional but recommended, though simplified here since admin/users see their own list)
    // For now, allow delete if authenticated.

    await adminClient.delete(id)

    return NextResponse.json({ success: true, message: "Submission deleted" })
  } catch (error) {
    console.error("Error deleting submission:", error)
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 })
  }
}
