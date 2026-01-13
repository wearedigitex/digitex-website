import BlogClient from "./BlogClient"
import { Metadata } from "next"
import { getBlogPosts } from "@/lib/sanity"

export const metadata: Metadata = {
  title: "Insights | Digitex Blog",
  description: "Exploring the frontiers of technology, innovation, and digital culture. Read the latest articles from the Digitex team.",
  openGraph: {
    title: "Insights | Digitex Blog",
    description: "Exploring the frontiers of technology, innovation, and digital culture.",
    type: "website",
    url: "https://wearedigitex.org/blog",
  },
}

export default async function BlogPage() {
  const initialPosts = await getBlogPosts()
  return <BlogClient initialPosts={initialPosts} />
}
