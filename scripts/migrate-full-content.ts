
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
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

async function migrateContent() {
  const dataPath = path.join(process.cwd(), 'full_scraped_data.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const articles = JSON.parse(rawData)

  console.log(`Found ${articles.length} articles to migrate.`)

  for (const article of articles) {
    console.log(`Processing: ${article.title}`)

    // 1. Find the post in Sanity by slug (derived from title) or title match
    // The slug might be slightly different so we try to match by title first
    const query = `*[_type == "post" && title == $title][0]`
    const existingPost = await client.fetch(query, { title: article.title })

    if (!existingPost) {
      console.warn(`  - Post not found in Sanity: "${article.title}"`)
      continue
    }

    console.log(`  - Found post ID: ${existingPost._id}`)

    // 2. Patch the post with the new bodyHtml
    try {
      await client
        .patch(existingPost._id)
        .set({
          bodyHtml: article.bodyHtml,
          // We can also update the main image if it's missing or different, 
          // but for now let's focus on the body content as requested.
        })
        .commit()
      
      console.log(`  - Successfully updated bodyHtml.`)
    } catch (err: any) {
      console.error(`  - Failed to update post: ${err.message}`)
    }
  }

  console.log('Migration complete.')
}

migrateContent()
