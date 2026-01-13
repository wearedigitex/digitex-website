import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

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

async function initializeLikes() {
  console.log('Fetching all posts...')
  
  // Fetch all posts and check their likes field
  const posts = await client.fetch(
    `*[_type == "post"] {
      _id,
      title,
      likes
    }`
  )

  console.log(`Found ${posts.length} posts to check.`)

  let updatedCount = 0
  let skippedCount = 0

  for (const post of posts) {
    // Check if likes is null, undefined, or not a number
    if (typeof post.likes !== 'number' || isNaN(post.likes)) {
      console.log(`Initializing likes for: "${post.title}" (${post._id})`)
      
      try {
        await client
          .patch(post._id)
          .set({ likes: 0 })
          .commit()
        
        updatedCount++
        console.log(`  ✅ Set likes to 0`)
      } catch (error: any) {
        console.error(`  ❌ Failed to update: ${error.message}`)
      }
    } else {
      skippedCount++
      console.log(`  ⏭️  Skipping "${post.title}" - already has likes: ${post.likes}`)
    }
  }

  console.log(`\n✅ Initialization complete!`)
  console.log(`   Updated: ${updatedCount} posts`)
  console.log(`   Skipped: ${skippedCount} posts`)
}

initializeLikes().catch(console.error)
