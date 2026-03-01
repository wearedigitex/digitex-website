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
    const posts = await adminClient.fetch(`*[_type == "post"]{_id, title}`)
    console.log(`Found ${posts.length} posts to update.`)

    for (const post of posts) {
        const randomViews = Math.floor(Math.random() * 101) + 100 // 100 to 200 included
        await adminClient
            .patch(post._id)
            .set({ viewCount: randomViews })
            .commit()

        console.log(`✅ Updated ${post.title} to ${randomViews} views`)
    }

    console.log("All posts updated!")
}

randomizeViews().catch(console.error)
