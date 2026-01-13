import ArticleClient from "./ArticleClient"
import { getPostBySlug, getRecentPosts } from "@/lib/sanity"
import { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "Article Not Found | Digitex",
    }
  }

  return {
    title: `${post.title} | Digitex`,
    description: post.excerpt || `Read ${post.title} on Digitex.`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author?.name || "Digitex Team"],
      images: post.mainImage ? [{ url: post.mainImage.asset._ref }] : [], // Simplification, urlFor would be better but requires more setup here
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return <div>Article not found</div>
  }

  const recentPosts = await getRecentPosts(post._id)

  return <ArticleClient initialPost={post} initialRecentPosts={recentPosts} />
}
