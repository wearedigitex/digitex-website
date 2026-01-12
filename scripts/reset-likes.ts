
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6rn1uybc"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const token = process.env.SANITY_API_TOKEN || "skBIvMTHZd90LOZV2RMeZMLT8jFQAmIAVTjiF1O4741FQovx4a4b6BG0TD61HOu5KvyJohRsXJEZsHJtJCRnUqqf0Wvj5RWy4drUl5m0yDAxqfvWCopxIHptvVBpfLPJpYRXeOcEoXKJNedxrsDPQYkDo0y15EajyR9e5hFfa4chLksIy3RH"

if (!projectId || !dataset || !token) {
  console.error('Missing Sanity configuration. Please check .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function resetLikes() {
  try {
    console.log('Fetching all posts...')
    const posts = await client.fetch(`*[_type == "post"] {_id, title, likes}`)
    console.log(`Found ${posts.length} posts.`)

    let updatedCount = 0

    for (const post of posts) {
      if (post.likes !== 0) {
        console.log(`Resetting likes for: ${post.title} (current: ${post.likes})`)
        await client.patch(post._id).set({ likes: 0 }).commit()
        updatedCount++
      }
    }

    console.log('-----------------------------------')
    console.log(`Reset complete. Updated ${updatedCount} posts.`)
    console.log('-----------------------------------')

  } catch (error) {
    console.error('Error resetting likes:', error)
  }
}

resetLikes()
