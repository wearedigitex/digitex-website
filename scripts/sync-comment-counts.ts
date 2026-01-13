import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function syncCommentCounts() {
  console.log('Starting comment count re-sync...')

  try {
    // 1. Fetch all posts
    const posts = await adminClient.fetch(`*[_type == "post"] { _id, title, commentCount }`)
    console.log(`Found ${posts.length} posts.`)

    for (const post of posts) {
      // 2. Count approved comments for this post
      const approvedComments = await adminClient.fetch(
        `*[_type == "comment" && post._ref == $postId && approved == true] { _id, autoApproved }`,
        { postId: post._id }
      )

      const actualCount = approvedComments.length
      console.log(`Post "${post.title}": Current count in Sanity: ${post.commentCount || 0}, Actual approved comments: ${actualCount}`)

      // 3. Update post if count is different
      if (post.commentCount !== actualCount) {
        await adminClient
          .patch(post._id)
          .set({ commentCount: actualCount })
          .commit()
        console.log(`✅ Updated count for "${post.title}" to ${actualCount}`)
      }

      // 4. Ensure all approved comments have autoApproved: true (for future deletions)
      const missingAutoApproved = approvedComments.filter((c: any) => !c.autoApproved)
      if (missingAutoApproved.length > 0) {
        const transaction = adminClient.transaction()
        missingAutoApproved.forEach((c: any) => {
          transaction.patch(c._id, p => p.set({ autoApproved: true }))
        })
        await transaction.commit()
        console.log(`✅ Set autoApproved: true for ${missingAutoApproved.length} comments on "${post.title}"`)
      }
    }

    console.log('Re-sync completed successfully.')
  } catch (error) {
    console.error('Error during re-sync:', error)
  }
}

syncCommentCounts()
