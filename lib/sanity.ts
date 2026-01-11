import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6rn1uybc"
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
export const apiVersion = "2024-01-01"

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false to get freshest data
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Function to fetch all team members
export async function getTeamMembers() {
  return client.fetch(
    `*[_type == "author"] | order(name asc) {
      _id,
      name,
      role,
      department,
      "imageUrl": image.asset->url,
      bio
    }`
  )
}

// Function to fetch blog posts
export async function getBlogPosts() {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      category,
      publishedAt,
      excerpt,
      "authorName": author->name,
      "imageUrl": mainImage.asset->url
    }`
  )
}
