import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Send email using Resend
    const result = await sendContactEmail(name, normalizedEmail, message)

    if (!result.success) {
      console.error('Failed to send contact email:', result.error)
      // We still return 200 to the user but log the error
      // In production, you might want to return 500 if it's critical
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
