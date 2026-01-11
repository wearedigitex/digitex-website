const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectId: '6rn1uybc', // from .env.local
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skBIvMTHZd90LOZV2RMeZMLT8jFQAmIAVTjiF1O4741FQovx4a4b6BG0TD61HOu5KvyJohRsXJEZsHJtJCRnUqqf0Wvj5RWy4drUl5m0yDAxqfvWCopxIHptvVBpfLPJpYRXeOcEoXKJNedxrsDPQYkDo0y15EajyR9e5hFfa4chLksIy3RH' 
};

const client = createClient(config);
const data = require('./scraped_data.json');

async function migrate() {
  console.log("Starting migration (Standalone Mode)...");

  // 1. Migrate Team Members
  const authorIdMap = new Map(); // Name -> _id

  console.log(`Found ${data.team.length} team members.`);

  for (const member of data.team) {
    console.log(`Processing Author: ${member.name}...`);
    
    // Upload Image
    let imageAsset = null;
    if (member.image_url && member.image_url !== 'Not found') {
       try {
         const res = await fetch(member.image_url);
         if (res.ok) {
           const buffer = await res.arrayBuffer();
           imageAsset = await client.assets.upload('image', Buffer.from(buffer), { filename: `${member.name.replace(/\s+/g, '-')}.jpg` });
         }
       } catch (e) {
         console.warn(`Failed to upload image for ${member.name}: ${e.message}`);
       }
    }

    const doc = {
      _type: 'author',
      name: member.name,
      role: member.role,
      department: member.department, // Ensure this matches schema options exactly
      bio: member.bio,
      slug: { _type: 'slug', current: member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
      image: imageAsset ? { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } } : undefined
    };

    try {
        const createdAuthor = await client.createOrReplace({_id: `author-${doc.slug.current}`, ...doc});
        authorIdMap.set(member.name, createdAuthor._id);
        console.log(`✅ Migrated ${member.name}`);
    } catch (err) {
        console.error(`❌ Failed to migrate author ${member.name}:`, err.message);
    }
  }

  // 2. Migrate Posts
  console.log(`Found ${data.posts.length} blog posts.`);

  for (const post of data.posts) {
    console.log(`Processing Post: ${post.title}...`);
    
    // Upload Image
    let imageAsset = null;
    if (post.image && !post.image.includes('logo.png')) {
       try {
         const res = await fetch(post.image);
         if (res.ok) {
           const buffer = await res.arrayBuffer();
           imageAsset = await client.assets.upload('image', Buffer.from(buffer), { filename: `post-${post.date.replace(/\//g, '-')}.jpg` });
         }
       } catch (e) {
         console.warn(`Failed to upload image for ${post.title}`);
       }
    }
    
    // Find Author ID
    let authorRef = null;
    // Iterate to find a matching author
    for (const [name, id] of authorIdMap.entries()) {
      // Logic to match "Raahi Chheda" from post with "Raahi Chheda" in map
      if (post.author.includes(name) || name.includes(post.author)) {
        authorRef = id;
        break;
      }
    }

    const doc = {
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
      publishedAt: new Date(post.date).toISOString(),
      category: post.category.toUpperCase(), 
      excerpt: post.excerpt,
      author: authorRef ? { _type: 'reference', _ref: authorRef } : undefined,
      mainImage: imageAsset ? { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } } : undefined,
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: post.excerpt }],
          markDefs: [],
          style: 'normal'
        }
      ]
    };

    try {
        // Use createOrReplace to avoid duplicates if run multiple times
        await client.createOrReplace({ _id: `post-${doc.slug.current}`, ...doc });
         console.log(`✅ Migrated Post: ${post.title}`);
    } catch (e) {
        console.error(`❌ Error creating post ${post.title}: ${e.message}`);
    }
  }

  console.log("Migration complete!");
}

migrate();
