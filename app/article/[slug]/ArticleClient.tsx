"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, User, Eye, MessageSquare, Share2, Check, ArrowUp } from "lucide-react"
import { PortableText } from "@portabletext/react"
import { motion, useScroll, useSpring } from "framer-motion"
import { getPostBySlug, getRecentPosts, urlFor } from "@/lib/sanity"
import { Button } from "@/components/ui/button"
import { CommentsSection } from "@/components/comments-section"
import { getObjectPosition } from "@/lib/utils"
import { LikeButton } from "@/components/like-button"

interface ArticleClientProps {
  initialPost: any
  initialRecentPosts?: any[]
}

export default function ArticlePage({ initialPost, initialRecentPosts = [] }: ArticleClientProps) {
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<any>(initialPost)
  const [recentPosts, setRecentPosts] = useState<any[]>(initialRecentPosts)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Increment view count via internal API
    // We add a 3 second delay to ensure it's a real view and not a bounce or fast reload
    let viewTimeout: NodeJS.Timeout;

    if (post?._id) {
      viewTimeout = setTimeout(() => {
        fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post._id }),
        }).catch(err => console.error("Failed to increment views:", err))
      }, 3000)
    }

    return () => {
      if (viewTimeout) clearTimeout(viewTimeout)
    }
  }, [post?._id])

  useEffect(() => {
    // Only reload if slug changes and doesn't match initialPost
    if (post && post.slug === slug) return;

    async function loadData() {
      setLoading(true)
      try {
        const data = await getPostBySlug(slug)
        setPost(data)

        if (data?._id) {
          const recent = await getRecentPosts(data._id)
          setRecentPosts(recent)
        }
      } catch (error) {
        console.error("Failed to load article data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, post])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="text-gray-500 animate-pulse text-xl">Decoding Article...</div>
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
    <main className="min-h-screen bg-black text-white pt-24 pb-20 relative">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#28829E] z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-6">
        {/* Article Header Animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-[#28829E]/20 text-[#28829E] rounded-full text-sm font-bold border border-[#28829E]/30">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
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
              <span className="text-sm">{post.commentCount || 0}</span>
            </div>
            <LikeButton postId={post._id} initialLikes={post.likes || 0} />

            <button
              onClick={handleCopyLink}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              <span className="text-sm font-medium">{copied ? "Copied!" : "Share Link"}</span>
            </button>
          </div>
        </motion.div>

        {/* Featured Image */}
        {post.mainImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl"
          >
            <Image
              src={urlFor(post.mainImage).url()}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              style={{ objectPosition: getObjectPosition(post.mainImage.hotspot) }}
            />
          </motion.div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl font-medium text-gray-300 mb-12 leading-relaxed font-serif italic border-l-4 border-[#28829E] pl-6"
          >
            {post.excerpt}
          </motion.div>
        )}

        {/* Article Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose prose-invert prose-lg max-w-none mb-16"
        >
          {post.bodyHtml ? (
            <div className="article-content" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          ) : post.body ? (
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
                types: {
                  image: ({ value }) => {
                    if (!value?.asset?._ref) {
                      return null
                    }
                    return (
                      <div className="my-10 relative w-full h-[450px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <Image
                          src={urlFor(value).url()}
                          alt={value.alt || "Article Image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available for this article.</p>
          )}
        </motion.div>

        {/* Author Bio */}
        {post.author && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0A0A0A] rounded-3xl p-8 border border-white/10 mb-20 relative z-10 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
              {post.author.image ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                  <Image
                    src={urlFor(post.author.image).url()}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: getObjectPosition(post.author.image?.hotspot) }}
                  />
                </div>
              ) : post.author.imageUrl && (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                  <Image
                    src={post.author.imageUrl}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">About {post.author.name}</h3>
                <p className="text-[#28829E] font-medium mb-4">{post.author.role}</p>
                <p className="text-gray-400 leading-relaxed">
                  {post.author.bio || `${post.author.name} is a key contributor to the Digitex publication, exploring the frontiers of digital innovation.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <div className="mb-32">
          <CommentsSection postId={post._id} />
        </div>

        {/* Recent Articles */}
        {recentPosts.length > 0 && (
          <div className="pt-16 border-t border-white/10">
            <h2 className="text-3xl font-bold mb-10">Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentPosts.map((rPost) => (
                <Link key={rPost._id} href={`/article/${rPost.slug}`} className="group block h-full">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-white/10 shadow-md">
                    {rPost.mainImage ? (
                      <Image
                        src={urlFor(rPost.mainImage).url()}
                        alt={rPost.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{ objectPosition: getObjectPosition(rPost.mainImage?.hotspot) }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-gray-700 font-mono">DigiteX</div>
                    )}
                    {rPost.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-[10px] font-bold text-[#28829E] rounded-lg uppercase tracking-wider border border-white/10">
                          {rPost.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold leading-tight group-hover:text-[#28829E] transition-colors line-clamp-2 mb-4">
                    {rPost.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(rPost.publishedAt), 'MMM dd')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {rPost.viewCount || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#28829E] text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-teal-700 transition-colors border border-white/20"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}
    </main>
  )
}
