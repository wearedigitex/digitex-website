"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const CATEGORIES = ["All", "News", "Technology", "Startups", "Opinion"]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Our <span className="text-[#28829E]">Insights</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Exploring the frontiers of technology, innovation, and digital culture.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? "bg-[#28829E] text-white" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10 bg-[#111] border-white/10 text-white rounded-full h-12 focus:border-[#28829E]"
          />
        </div>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading articles...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts
            .filter(p => activeCategory === "All" || p.category === activeCategory)
            .map((post) => (
            <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer"
          >
            {/* Image Card */}
            <div className="aspect-[4/3] bg-[#0A0A0A] rounded-2xl overflow-hidden mb-6 border border-white/5 group-hover:border-[#28829E]/50 transition-colors relative">
               <div className="absolute inset-0 flex items-center justify-center text-gray-700 bg-grid-pattern opacity-20">
                 {/* Placeholder for real image */}
                 [Image Placeholder]
               </div>
               
               {/* Category Tag */}
               <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-[#28829E] border border-white/10">
                 {post.category}
               </div>
            </div>

            {/* Content */}
            <div className="pr-4">
              <div className="text-sm text-gray-500 mb-2">{post.date}</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#28829E] transition-colors leading-tight">
                {post.title}
              </h3>
              <p className="text-gray-400 mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                Read Article <ArrowRight className="w-4 h-4 text-[#28829E]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </main>
  )
}
