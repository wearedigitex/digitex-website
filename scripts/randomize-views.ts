import { createClient } from "next-sanity"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6rn1uybc"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = "2024-01-01"

// Admin client for server-side operations (with token)
const adminClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function randomizeViews() {
    const posts = await adminClient.fetch(`*[_type == "post" && (!defined(viewCount) || viewCount <= 10)]{_id, title, viewCount}`)
    console.log(`Found ${posts.length} posts with <= 10 views to update.`)

    for (const post of posts) {
        const randomViews = Math.floor(Math.random() * 51) + 50 // 50 to 100 included
        await adminClient
            .patch(post._id)
            .set({ viewCount: randomViews })
            .commit()

        console.log(`✅ Updated ${post.title} (previously ${post.viewCount || 0}) to ${randomViews} views`)
    }

    console.log("All posts updated!")
}

randomizeViews().catch(console.error)
