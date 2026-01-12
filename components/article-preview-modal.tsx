"use client"

import { X, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

interface ArticlePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    title: string
    category: string
    excerpt: string
    bodyHtml: string
    mainImagePreview: string | null
    authorName: string
    date: Date
    mainImageHotspot?: { x: number, y: number }
  }
}

export function ArticlePreviewModal({ isOpen, onClose, data }: ArticlePreviewModalProps) {
  if (!isOpen) return null

  // Helper to safely format body HTML to ensure it renders reasonably well
  // We can wrap it in the same prose classes as the main article page
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto"
      >
        <div className="min-h-screen px-6 py-12">
            {/* Close Bar */}
            <div className="fixed top-6 right-6 z-50">
                <Button 
                    onClick={onClose}
                    variant="outline" 
                    className="bg-black/50 border-white/20 hover:bg-white/10 text-white rounded-full w-12 h-12 p-0 flex items-center justify-center"
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Content Container - Mimics ArticlePage layout */}
            <article className="max-w-4xl mx-auto bg-black text-white p-6 md:p-12 rounded-2xl border border-white/5 shadow-2xl relative">
                <div className="absolute top-4 left-6 px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded border border-yellow-500/30">
                    PREVIEW MODE
                </div>

                 {/* Category Badge */}
                <div className="mb-4 mt-8">
                    <span className="inline-block px-4 py-1 bg-[#28829E]/20 text-[#28829E] rounded-full text-sm font-bold border border-[#28829E]/30">
                        {data.category}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    {data.title || "Untitled Article"}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{format(data.date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{data.authorName}</span>
                    </div>
                </div>

                {/* Featured Image */}
                {data.mainImagePreview && (
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12 border border-white/10">
                        <img
                            src={data.mainImagePreview}
                            alt={data.title}
                            className="w-full h-full object-cover"
                            style={{ 
                                objectPosition: data.mainImageHotspot 
                                    ? `50% ${data.mainImageHotspot.y * 100}%` 
                                    : 'center' 
                            }}
                        />
                    </div>
                )}

                {/* Excerpt */}
                {data.excerpt && (
                    <div className="text-xl md:text-2xl font-medium text-gray-300 mb-12 leading-relaxed font-serif italic border-l-4 border-[#28829E] pl-6">
                        {data.excerpt}
                    </div>
                )}

                {/* Article Body */}
                <div className="prose prose-invert prose-lg max-w-none mb-16">
                     <div className="article-content" dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
                </div>
            </article>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
