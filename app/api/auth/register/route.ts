import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { adminClient } from "@/lib/sanity"

// Check if public registration is enabled
const ALLOW_PUBLIC_REGISTRATION = process.env.ALLOW_PUBLIC_REGISTRATION === "true"

export async function POST(request: NextRequest) {
  try {
    // Check if public registration is enabled
    if (!ALLOW_PUBLIC_REGISTRATION) {
      return NextResponse.json({ 
        error: "Public registration is disabled. Please contact an administrator for an invitation." 
      }, { status: 403 })
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: normalizedEmail }
    )

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (without author link - admin can add later)
    const newUser = await adminClient.create({
      _type: "user",
      email: normalizedEmail,
      password: hashedPassword,
      role: "contributor",
      status: "active",
      // Note: No author reference - admin needs to link manually
    })

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully",
      userId: newUser._id 
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ 
      error: "Failed to create account",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
