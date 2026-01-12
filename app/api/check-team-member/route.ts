
import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists in Sanity with this email
    // We check the "user" document type as requested
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0] { _id, verificationCode }`,
      { email }
    )

    // Return true if user exists and has a verification code set
    // Using verificationCode existence as a proxy for "team member who can verify"
    const isTeamMember = !!user && !!user.verificationCode

    return NextResponse.json({ isTeamMember })
  } catch (error) {
    console.error("Error checking team status:", error)
    return NextResponse.json({ error: "Failed to check team status" }, { status: 500 })
  }
}
