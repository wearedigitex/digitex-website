"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, User, Eye, MessageSquare, Share2, Check } from "lucide-react"
import { PortableText } from "@portabletext/react"
import { getPostBySlug } from "@/lib/sanity"
import { Button } from "@/components/ui/button"

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getPostBySlug(slug)
        setPost(data)
        
        // Increment view count
        if (data?._id) {
          await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: data._id }),
          })
        }
      } catch (error) {
        console.error("Failed to load post:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [slug])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="text-gray-500">Loading article...</div>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button className="bg-[#28829E] hover:bg-teal-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-4 py-1 bg-[#28829E]/20 text-[#28829E] rounded-full text-sm font-bold border border-[#28829E]/30">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
          </div>
          {post.author && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{post.author.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{post.viewCount || 0} views</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{post.commentCount || 0} comments</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            <span className="text-sm">{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12 border border-white/10">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none mb-16">
          <PortableText
            value={post.body}
            components={{
              block: {
                normal: ({ children }) => <p className="text-gray-300 leading-relaxed mb-6">{children}</p>,
                h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 mt-12">{children}</h1>,
                h2: ({ children }) => <h2 className="text-3xl font-bold mb-4 mt-10">{children}</h2>,
                h3: ({ children }) => <h3 className="text-2xl font-bold mb-3 mt-8">{children}</h3>,
              },
              marks: {
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                link: ({ value, children }) => (
                  <a href={value.href} className="text-[#28829E] hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              },
            }}
          />
        </div>

        {/* Author Bio */}
        {post.author && (
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-16">
            <div className="flex items-start gap-6">
              {post.author.imageUrl && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={post.author.imageUrl}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold mb-1">About {post.author.name}</h3>
                <p className="text-[#28829E] text-sm mb-3">{post.author.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {post.author.bio || `${post.author.name} is a contributor to Digitex.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}
