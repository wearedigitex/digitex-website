import { adminClient } from '../lib/sanity'

/**
 * Script to clean up article formatting:
 * 1. Remove author signatures at the end (hr + author name + department)
 * 2. Normalize font sizes and styles for consistency
 */

async function cleanArticleFormatting() {
  console.log('🧹 Starting article formatting cleanup...\n')

  try {
    // Fetch all posts
    const posts = await adminClient.fetch(
      `*[_type == "post"] {
        _id,
        title,
        bodyHtml
      }`
    )

    console.log(`Found ${posts.length} posts with HTML content\n`)

    for (const post of posts) {
      console.log(`Processing: ${post.title}`)
      
      // Skip if no bodyHtml
      if (!post.bodyHtml) {
        console.log(`  - No HTML content, skipping`)
        continue
      }
      
      let cleanedHtml = post.bodyHtml

      // Remove author signature pattern: <hr> followed by author name and department
      // Pattern 1: <hr><p>Name,</p><p>Department</p>
      cleanedHtml = cleanedHtml.replace(
        /<hr[^>]*>\s*<p[^>]*>[^<]*,\s*<\/p>\s*<p[^>]*>Department of [^<]*<\/p>/gi,
        ''
      )

      // Pattern 2: <hr style="..."><p dir="..." style="...">Name,</p><p dir="..." style="...">Department</p>
      cleanedHtml = cleanedHtml.replace(
        /<hr[^>]*>\s*<p[^>]*>[^<]*,\s*<\/p>\s*<p[^>]*>Department of [^<]*<\/p>\s*<div[^>]*>.*?<\/div>/gi,
        ''
      )

      // Pattern 3: Just <hr> followed by name/department in any format
      cleanedHtml = cleanedHtml.replace(
        /<hr[^>]*>\s*<p[^>]*><span[^>]*>[^<]*,\s*<\/span><\/p>\s*<p[^>]*><span[^>]*>Department of [^<]*<\/span><\/p>/gi,
        ''
      )

      // Normalize excessive inline font sizes (convert 21.120001px, 20px, 16pt to standard)
      cleanedHtml = cleanedHtml.replace(
        /font-size:\s*21\.120001px;?/gi,
        'font-size: 1.125rem;'
      )
      cleanedHtml = cleanedHtml.replace(
        /font-size:\s*20px;?/gi,
        'font-size: 1.125rem;'
      )
      cleanedHtml = cleanedHtml.replace(
        /font-size:\s*16pt;?/gi,
        'font-size: 1.125rem;'
      )

      // Remove excessive inline font-family declarations (let CSS handle it)
      cleanedHtml = cleanedHtml.replace(
        /font-family:\s*[^;]+;?/gi,
        ''
      )

      // Clean up empty style attributes
      cleanedHtml = cleanedHtml.replace(
        /style="\s*"/g,
        ''
      )

      // Only update if content changed
      if (cleanedHtml !== post.bodyHtml) {
        await adminClient
          .patch(post._id)
          .set({ bodyHtml: cleanedHtml })
          .commit()
        
        console.log(`  ✓ Cleaned and updated`)
      } else {
        console.log(`  - No changes needed`)
      }
    }

    console.log('\n✅ Article formatting cleanup complete!')
  } catch (error: any) {
    console.error('❌ Error during cleanup:', error.message)
    process.exit(1)
  }
}

cleanArticleFormatting()
