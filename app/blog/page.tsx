"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, ArrowRight, Eye, MessageSquare, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getBlogPosts } from "@/lib/sanity"
import { format } from "date-fns"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const CATEGORIES = ["All", "TECHNOLOGY", "MEDICINE", "COMMERCE", "GENERAL"]
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Most Viewed", value: "views" },
  { label: "Most Commented", value: "comments" },
]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [sortBy, setSortBy] = useState("newest")
  const [years, setYears] = useState<string[]>([])

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPosts()
        setPosts(data)
        
        // Extract unique years
        const uniqueYears = (Array.from(
          new Set(data.map((p: any) => new Date(p.publishedAt).getFullYear().toString()))
        ) as string[]).sort((a, b) => parseInt(b) - parseInt(a))
        setYears(uniqueYears)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  // Filter and sort posts
  useEffect(() => {
    let result = [...posts]

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory)
    }

    // Year filter
    if (selectedYear !== "All Years") {
      result = result.filter(p => new Date(p.publishedAt).getFullYear().toString() === selectedYear)
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        case "views":
          return (b.viewCount || 0) - (a.viewCount || 0)
        case "comments":
          return (b.commentCount || 0) - (a.commentCount || 0)
        default:
          return 0
      }
    })

    setFilteredPosts(result)
  }, [posts, activeCategory, selectedYear, searchQuery, sortBy])

  const hasActiveFilters = activeCategory !== "All" || selectedYear !== "All Years" || searchQuery !== "" || sortBy !== "newest"

  const clearFilters = () => {
    setActiveCategory("All")
    setSelectedYear("All Years")
    setSearchQuery("")
    setSortBy("newest")
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      {/* Banner */}
      <div className="max-w-7xl mx-auto mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#28829E]/20 via-purple-500/10 to-[#28829E]/20 border border-[#28829E]/30 p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Our <span className="text-[#28829E]">Insights</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Exploring the frontiers of technology, innovation, and digital culture.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-8 space-y-6">
        {/* Category Filters */}
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
              {cat === "All" ? "All Posts" : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search, Year, Sort, Clear */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#111] border-white/10 text-white rounded-full h-12 focus:border-[#28829E]"
            />
          </div>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-6 py-3 bg-[#111] border border-white/10 text-white rounded-full focus:border-[#28829E] focus:outline-none cursor-pointer"
          >
            <option value="All Years">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-3 bg-[#111] border border-white/10 text-white rounded-full focus:border-[#28829E] focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="px-6 rounded-full border-white/20 hover:bg-white/10 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto mb-8">
        <p className="text-gray-400 text-sm">
          Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading articles...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-xl mb-4">No articles found</p>
          <Button onClick={clearFilters} className="bg-[#28829E] hover:bg-teal-700">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link key={post._id} href={`/article/${post.slug}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer h-full flex flex-col"
              >
                {/* Image Card */}
                <div className="aspect-[4/3] bg-[#0A0A0A] rounded-2xl overflow-hidden mb-6 border border-white/5 group-hover:border-[#28829E]/50 transition-colors relative">
                  {post.imageUrl ? (
                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 bg-grid-pattern opacity-20">
                      DigiteX
                    </div>
                  )}
                  
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-[#28829E] border border-white/10">
                    {post.category}
                  </div>

                  {/* Stats */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-white/80">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                      <Eye className="w-3 h-3" />
                      <span>{post.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.commentCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pr-4 flex-1 flex flex-col">
                  <div className="text-sm text-gray-500 mb-2">{format(new Date(post.publishedAt), 'MMM dd, yyyy')} • {post.authorName}</div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-[#28829E] transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                    Read Article <ArrowRight className="w-4 h-4 text-[#28829E]" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
