import { Resend } from 'resend'

const resendKey = process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

export async function sendInvitationEmail(email: string, password: string) {
  try {
    await resend.emails.send({
      from: 'Digitex <onboarding@resend.dev>', // Change this to your verified domain
      to: email,
      subject: 'Welcome to Digitex - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28829E;">Welcome to Digitex!</h1>
          <p>You've been invited to join the Digitex team as a contributor.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Your Login Credentials</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <p>Please log in at <a href="${process.env.NEXTAUTH_URL}/login" style="color: #28829E;">digitex-website.vercel.app/login</a></p>
          
          <p><strong>Important:</strong> For security reasons, please change your password after your first login by visiting your dashboard settings.</p>
          
          <p>If you have any questions, please contact your administrator.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    return { success: false, error }
  }
}

export async function sendApprovalEmail(email: string, articleTitle: string, approved: boolean) {
  try {
    await resend.emails.send({
      from: 'Digitex <onboarding@resend.dev>',
      to: email,
      subject: approved 
        ? `Your article "${articleTitle}" has been approved!`
        : `Update on your article "${articleTitle}"`,
      html: approved
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28829E;">🎉 Article Approved!</h1>
            <p>Great news! Your article "<strong>${articleTitle}</strong>" has been approved and published.</p>
            <p>You can view it live on the Digitex website.</p>
            <p>Thank you for your contribution!</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28829E;">Article Update</h1>
            <p>Your article "<strong>${articleTitle}</strong>" requires some revisions.</p>
            <p>Please check your dashboard for feedback from the editor.</p>
          </div>
        `,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send approval email:', error)
    return { success: false, error }
  }
}
