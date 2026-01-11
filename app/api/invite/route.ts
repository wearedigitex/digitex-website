import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { client } from "@/lib/sanity"
import { sendInvitationEmail } from "@/lib/email"

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    const { email, authorId } = await request.json()

    if (!email || !authorId) {
      return NextResponse.json({ error: "Email and author ID required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    )

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Generate password
    const password = generatePassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Sanity
    const newUser = await client.create({
      _type: "user",
      email,
      password: hashedPassword,
      role: "contributor",
      status: "active",
      author: {
        _type: "reference",
        _ref: authorId,
      },
      invitedAt: new Date().toISOString(),
    })

    // Send invitation email
    await sendInvitationEmail(email, password)

    return NextResponse.json({ 
      success: true, 
      message: "Invitation sent successfully",
      userId: newUser._id 
    })
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ error: "Failed to invite user" }, { status: 500 })
  }
}
