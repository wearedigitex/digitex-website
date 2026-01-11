import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { adminClient } from "@/lib/sanity"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's submissions
    const submissions = await adminClient.fetch(
      `*[_type == "submission" && submittedBy->email == $email] | order(_createdAt desc) {
        _id,
        _createdAt,
        title,
        slug,
        category,
        excerpt,
        status,
        submittedAt,
        reviewNotes
      }`,
      { email: session.user.email }
    )

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Get user document
    const user = await adminClient.fetch(
      `*[_type == "user" && email == $email][0] { _id, author }`,
      { email: session.user.email }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create submission
    const submission = await adminClient.create({
      _type: "submission",
      title: data.title,
      slug: { current: data.slug },
      category: data.category,
      excerpt: data.excerpt,
      body: data.body,
      mainImage: data.mainImage,
      author: user.author,
      submittedBy: { _type: "reference", _ref: user._id },
      status: data.status || "draft",
      submittedAt: data.status === "submitted" ? new Date().toISOString() : null,
    })

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, ...data } = await request.json()

    // Update submission
    const updated = await adminClient
      .patch(id)
      .set({
        ...data,
        submittedAt: data.status === "submitted" ? new Date().toISOString() : undefined,
      })
      .commit()

    return NextResponse.json({ success: true, submission: updated })
  } catch (error) {
    console.error("Error updating submission:", error)
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
  }
}
