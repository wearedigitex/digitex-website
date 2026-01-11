import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { adminClient } from "@/lib/sanity"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // 1. Fetch user from Sanity
    const user = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: session.user.email }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 2. Verify current password
    const isCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isCorrect) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 })
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4. Update Sanity
    await adminClient
      .patch(user._id)
      .set({ password: hashedPassword })
      .commit()

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
