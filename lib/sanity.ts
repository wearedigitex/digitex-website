import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6rn1uybc"
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
export const apiVersion = "2024-01-01"

// Standard client for public data
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

// Admin client for server-side operations (with token)
export const adminClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || "skBIvMTHZd90LOZV2RMeZMLT8jFQAmIAVTjiF1O4741FQovx4a4b6BG0TD61HOu5KvyJohRsXJEZsHJtJCRnUqqf0Wvj5RWy4drUl5m0yDAxqfvWCopxIHptvVBpfLPJpYRXeOcEoXKJNedxrsDPQYkDo0y15EajyR9e5hFfa4chLksIy3RH",
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Function to fetch all team members
export async function getTeamMembers() {
  return client.fetch(
    `*[_type == "author" && (isGuest == false || !defined(isGuest))] | order(order asc, name asc) {
      _id,
      name,
      role,
      department,
      image,
      bio,
      linkedin
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
      mainImage,
      viewCount,
      commentCount,
      likes
    }`,
    {},
    { next: { revalidate: 0 } }
  )
}

// Function to fetch a single post by slug
export async function getPostBySlug(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      category,
      publishedAt,
      excerpt,
      body,
      bodyHtml,
      "author": author->{name, role, image, bio},
      mainImage,
      viewCount,
      commentCount,
      likes
    }`,
    { slug },
    { next: { revalidate: 0 } }
  )
}

// Function to increment view count
export async function incrementViewCount(postId: string) {
  return adminClient
    .patch(postId)
    .setIfMissing({ viewCount: 0 })
    .inc({ viewCount: 1 })
    .commit()
}

// Function to update like count
export async function updateLikeCount(postId: string, increment: boolean) {
  const patch = adminClient
    .patch(postId)
    .setIfMissing({ likes: 0 })

  if (increment) {
    patch.inc({ likes: 1 })
  } else {
    patch.dec({ likes: 1 })
  }

  return patch.commit()
}

// Function to fetch recent posts (excluding current)
export async function getRecentPosts(excludeId: string, limit: number = 3) {
  return client.fetch(
    `*[_type == "post" && _id != $excludeId] | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      category,
      publishedAt,
      mainImage,
      viewCount
    }`,
    { excludeId, limit },
    { next: { revalidate: 0 } }
  )
}
