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
  useCdn: true,
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

// Function to fetch all departments
export async function getDepartments() {
  return client.fetch(
    `*[_type == "department" && isActive == true] | order(order asc, name asc) {
      _id,
      name,
      fullName,
      slug,
      description,
      order
    }`
  )
}

// Function to fetch all team members
export async function getTeamMembers() {
  return client.fetch(
    `*[_type == "author" && (isGuest == false || !defined(isGuest))] | order(order asc, name asc) {
      _id,
      name,
      role,
      "department": department->{
        _id,
        name,
        fullName,
        slug,
        order
      },
      image,
      bio,
      linkedin,
      instagram,
      github
    }`
  )
}

// Function to fetch all categories
export async function getCategories() {
  return client.fetch(
    `*[_type == "category"] | order(order asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      color,
      order
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
      "category": category->{
        _id,
        name,
        "slug": slug.current,
        color
      },
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
      "category": category->{
        _id,
        name,
        "slug": slug.current,
        color
      },
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
  // First, fetch the current post to check if likes field exists and is a valid number
  const currentPost = await adminClient.fetch(
    `*[_id == $postId][0] { likes }`,
    { postId }
  )

  // If likes is null, undefined, or not a number, we need to initialize it
  const currentLikes = typeof currentPost?.likes === 'number' && !isNaN(currentPost.likes)
    ? currentPost.likes
    : null

  const patch = adminClient.patch(postId)

  if (currentLikes === null) {
    // Field is missing, null, or invalid - initialize it to 0 first
    patch.set({ likes: 0 })
  }

  if (increment) {
    patch.inc({ likes: 1 })
  } else {
    // For decrement, use dec but ensure we don't go below 0
    // If current likes is 0 or null, don't decrement
    if (currentLikes !== null && currentLikes > 0) {
      patch.dec({ likes: 1 })
    }
    // If currentLikes is null or 0, the set({ likes: 0 }) above already handles it
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
      "category": category->{
        _id,
        name,
        "slug": slug.current,
        color
      },
      publishedAt,
      mainImage,
      viewCount
    }`,
    { excludeId, limit },
    { next: { revalidate: 0 } }
  )
}
