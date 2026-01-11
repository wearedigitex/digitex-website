import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { adminClient } from "@/lib/sanity"
import { sendInvitationEmail } from "@/lib/email"
import { auth } from "@/lib/auth"

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
    // 1. Check session
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, authorId } = await request.json()

    if (!email || !authorId) {
      return NextResponse.json({ error: "Email and author ID required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 2. Check if user already exists
    const existingUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: normalizedEmail }
    )

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // 3. Generate password
    const password = generatePassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Create user in Sanity
    console.log("Inviting user:", normalizedEmail)
    const newUser = await adminClient.create({
      _type: "user",
      email: normalizedEmail,
      password: hashedPassword,
      role: "contributor",
      status: "active",
      author: {
        _type: "reference",
        _ref: authorId,
      },
      invitedAt: new Date().toISOString(),
    })

    // 5. Send invitation email
    console.log("Sending invitation email to:", normalizedEmail)
    const emailResult = await sendInvitationEmail(normalizedEmail, password)
    
    if (!emailResult.success) {
      console.error("Failed to send email, but user was created:", emailResult.error)
      return NextResponse.json({ 
        success: true, 
        message: "User created, but email failed to send (likely Resend sandbox restriction).",
        tempPassword: password,
        userId: newUser._id 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Invitation sent successfully",
      userId: newUser._id 
    })
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ 
      error: "Failed to invite user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
