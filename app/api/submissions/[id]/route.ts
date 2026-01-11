import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { adminClient } from "@/lib/sanity"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Fetch submission details
    const submission = await adminClient.fetch(
      `*[_type == "submission" && _id == $id][0] {
        _id,
        title,
        "slug": slug,
        category,
        excerpt,
        body,
        bodyHtml,
        mainImage,
        status,
        submittedAt,
        reviewNotes
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
