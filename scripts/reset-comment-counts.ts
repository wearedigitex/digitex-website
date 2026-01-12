
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function resetCommentCounts() {
  console.log('🔄 Fetching all posts...')
  const posts = await client.fetch(`*[_type == "post"]{_id, title}`)
  console.log(`✅ Found ${posts.length} posts.`)

  for (const post of posts) {
    // Count ONLY approved comments for this post
    const count = await client.fetch(
      `count(*[_type == "comment" && post._ref == $postId && approved == true])`,
      { postId: post._id }
    )

    console.log(`📝 Post: "${post.title}" has ${count} approved comments.`)

    // Update the post
    await client
        .patch(post._id)
        .set({ commentCount: count })
        .commit()
  }

  console.log('✨ All comment counts reset successfully!')
}

resetCommentCounts().catch((err) => {
  console.error('❌ Error resetting comment counts:', err)
  process.exit(1)
})
