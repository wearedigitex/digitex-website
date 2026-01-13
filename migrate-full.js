const { createClient } = require('@sanity/client');
const fs = require('fs');

// Configuration - using the same as in migrate.js
const config = {
  projectId: '6rn1uybc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skBIvMTHZd90LOZV2RMeZMLT8jFQAmIAVTjiF1O4741FQovx4a4b6BG0TD61HOu5KvyJohRsXJEZsHJtJCRnUqqf0Wvj5RWy4drUl5m0yDAxqfvWCopxIHptvVBpfLPJpYRXeOcEoXKJNedxrsDPQYkDo0y15EajyR9e5hFfa4chLksIy3RH' 
};

const client = createClient(config);

async function migrate() {
  console.log("Starting Full Data Migration...");

  let rawData;
  try {
    rawData = fs.readFileSync('./full_scraped_data.json', 'utf8');
  } catch (err) {
    console.error("Could not read full_scraped_data.json:", err.message);
    return;
  }
  
  const posts = JSON.parse(rawData);
  console.log(`Found ${posts.length} posts to migrate.`);

  // To keep track of authors and avoid duplicates/repeated requests
  const authorMap = new Map();

  for (const post of posts) {
    console.log(`\n--- Processing: ${post.title} ---`);

    // 1. Handle Author
    const authorName = post.author || "DigiteX Team";
    let authorId = authorMap.get(authorName);

    if (!authorId) {
      console.log(`Finding or creating author: ${authorName}`);
      const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const authorDoc = {
        _type: 'author',
        name: authorName,
        slug: { _type: 'slug', current: authorSlug },
        role: 'Contributor',
        department: authorName === "DigiteX Team" ? "Leadership" : "Department of Technology" // Defaulting
      };

      try {
        const result = await client.createOrReplace({ _id: `author-${authorSlug}`, ...authorDoc });
        authorId = result._id;
        authorMap.set(authorName, authorId);
        console.log(`✅ Author ready: ${authorName} (${authorId})`);
      } catch (err) {
        console.error(`❌ Failed to handle author ${authorName}:`, err.message);
        continue;
      }
    }

    // 2. Handle Image
    let imageAsset = null;
    if (post.mainImage && !post.mainImage.includes('logo.png')) {
      console.log(`Uploading image: ${post.mainImage}`);
      try {
        const res = await fetch(post.mainImage);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          imageAsset = await client.assets.upload('image', Buffer.from(buffer), { 
            filename: `post-${post.id || Date.now()}.jpg` 
          });
          console.log(`✅ Image uploaded: ${imageAsset._id}`);
        } else {
          console.warn(`⚠️ Failed to fetch image: ${post.mainImage} (Status: ${res.status})`);
        }
      } catch (err) {
        console.warn(`⚠️ Error uploading image for ${post.title}:`, err.message);
      }
    }

    // 3. Create Post
    const postSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Convert date "1/2/2026" to ISO or similar if possible
    let publishedAt = new Date().toISOString();
    if (post.date) {
        try {
            publishedAt = new Date(post.date).toISOString();
        } catch (e) {
            console.warn(`⚠️ Invalid date format: ${post.date}, using today.`);
        }
    }

    const postDoc = {
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: postSlug },
      publishedAt,
      category: post.category || 'GENERAL',
      author: { _type: 'reference', _ref: authorId },
      mainImage: imageAsset ? { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } } : undefined,
      bodyHtml: post.bodyHtml,
      excerpt: post.bodyHtml ? post.bodyHtml.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : '',
      viewCount: 0,
      commentCount: 0,
      likes: 0
    };

    try {
      await client.createOrReplace({ _id: `post-${postSlug}`, ...postDoc });
      console.log(`✅ Migrated Post: ${post.title}`);
    } catch (err) {
      console.error(`❌ Failed to migrate post ${post.title}:`, err.message);
    }
  }

  console.log("\nMigration completed successfully!");
}

migrate();
