# Resend Email Setup Guide for Digitex

## Prerequisites
- Custom domain: `wearedigitex.org` (already purchased via Cloudflare)
- Resend account (free tier available)

## Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up with your email (use `wearedigitex@gmail.com` or your admin email)
3. Verify your email address

## Step 2: Add and Verify Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `wearedigitex.org`
4. Resend will provide DNS records to add

## Step 3: Configure DNS Records in Cloudflare

Go to Cloudflare → DNS → Records and add these records (Resend will show exact values):

### SPF Record (TXT)
- **Type**: `TXT`
- **Name**: `@`
- **Content**: `v=spf1 include:_spf.resend.com ~all`
- **TTL**: Auto

### DKIM Records (TXT)
Resend will provide 3 DKIM records like:
- **Type**: `TXT`
- **Name**: `resend._domainkey` (or similar, check Resend dashboard)
- **Content**: (long string provided by Resend)
- **TTL**: Auto

### DMARC Record (TXT) - Optional but recommended
- **Type**: `TXT`
- **Name**: `_dmarc`
- **Content**: `v=DMARC1; p=none; rua=mailto:wearedigitex@gmail.com`
- **TTL**: Auto

## Step 4: Wait for Verification

1. After adding DNS records, go back to Resend
2. Click **Verify Domain**
3. Verification usually takes 5-15 minutes (can take up to 48 hours)
4. You'll see a green checkmark when verified

## Step 5: Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `Digitex Production`
4. Select **Full Access** (or **Sending Access** if you only need to send emails)
5. Copy the API key (starts with `re_...`)

## Step 6: Add API Key to Vercel

### Option A: Via Vercel Dashboard (Recommended)
1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_api_key_here`
   - **Environment**: Production, Preview, Development (select all)
3. Click **Save**
4. **Redeploy** your project for changes to take effect

### Option B: Via Local .env.local (for testing)
Add to your `.env.local` file:
```bash
RESEND_API_KEY=re_your_api_key_here
```

## Step 7: Update NEXTAUTH_URL in Vercel

Since you now have a custom domain, update this environment variable:

1. Go to Vercel → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Update value to: `https://wearedigitex.org`
4. Save and redeploy

## Step 8: Update Email "From" Address

Once your domain is verified, you can use a custom email address instead of `onboarding@resend.dev`.

In your code (`lib/email.ts`), the `from` field is currently:
```typescript
from: 'Digitex <onboarding@resend.dev>'
```

After verification, change it to:
```typescript
from: 'Digitex <noreply@wearedigitex.org>'
// or
from: 'Digitex <team@wearedigitex.org>'
```

**Note**: You don't need to create these email addresses. Resend handles them automatically once your domain is verified.

## Step 9: Test the Email System

1. Go to your dashboard → Invite a user
2. Use a real email address (not Gmail initially, as it might go to spam)
3. Check if the email arrives
4. Check Resend dashboard → **Logs** to see delivery status

## Troubleshooting

### Emails going to spam
- Make sure all DNS records are properly configured
- Add DMARC record if not already added
- Consider adding a custom "From" address after domain verification

### Domain verification failing
- Double-check DNS records in Cloudflare
- Make sure **Proxy status** is set to **DNS only** (gray cloud)
- Wait longer (DNS propagation can take time)
- Use `dig` command to verify records:
  ```bash
  dig TXT wearedigitex.org
  dig TXT resend._domainkey.wearedigitex.org
  ```

### API key not working
- Make sure you copied the full key (starts with `re_`)
- Verify it's added to Vercel environment variables
- Redeploy after adding the variable

## Current Email Functions

Your app currently has these email functions:
1. **Invitation emails** - Sent when inviting new team members
2. **Approval emails** - Sent when articles are approved/rejected
3. **Contact form emails** - Sent when someone uses the contact form

All will work once Resend is properly configured!

---

**Need help?** Check Resend documentation: https://resend.com/docs
