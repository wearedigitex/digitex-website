"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenSquare, FileText, LogOut, Settings, Eye, LayoutDashboard, Database, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = (session?.user as any)?.role === "admin"

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also remove it from the blog if it's published. This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSubmissions(prev => prev.filter(s => s._id !== id))
      } else {
        const data = await response.json()
        alert(`Failed to delete: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("An unexpected error occurred while deleting")
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setError(null)
        // This will be populated by the session
        const response = await fetch("/api/submissions")
        const data = await response.json()

        if (Array.isArray(data)) {
          setSubmissions(data)
        } else {
          console.error("Dashboard: Expected array for submissions, got:", data)
          setError(data.error || "Failed to load submissions")
          setSubmissions([])
        }
      } catch (err) {
        console.error("Failed to load submissions:", err)
        setError("An unexpected error occurred while loading submissions")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      published: "bg-[#28829E]/20 text-[#28829E] border-[#28829E]/30",
    }
    const safeStatus = (status || "draft").toLowerCase()
    return colors[safeStatus] || colors.draft
  }

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      draft: "📝",
      submitted: "📤",
      approved: "✅",
      rejected: "❌",
      published: "🚀",
    }
    const safeStatus = (status || "draft").toLowerCase()
    return emojis[safeStatus] || "📄"
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-400">Manage your articles and submissions</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard/write">
            <div className="group p-8 bg-gradient-to-br from-[#28829E]/20 to-purple-500/10 border border-[#28829E]/30 rounded-2xl hover:border-[#28829E]/60 transition-all cursor-pointer">
              <PenSquare className="w-12 h-12 text-[#28829E] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-2">Write New Article</h3>
              <p className="text-gray-400">Start creating your next piece</p>
            </div>
          </Link>

          {isAdmin && (
            <Link href="/studio" target="_blank" rel="noopener noreferrer">
              <div className="group p-8 bg-gradient-to-br from-purple-500/20 to-[#28829E]/10 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 transition-all cursor-pointer">
                <Database className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Admin Studio</h3>
                <p className="text-gray-400">Manage all content and users</p>
              </div>
            </Link>
          )}

          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <FileText className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{submissions.length}</h3>
            <p className="text-gray-400">Total Submissions</p>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <Eye className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {Array.isArray(submissions) ? submissions.filter(s => s.status === "published").length : 0}
            </h3>
            <p className="text-gray-400">Published Articles</p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Your Submissions</h2>

          {loading ? (
            // Skeleton placeholders matching submission card dimensions
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-black/40 border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 w-20 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl inline-block max-w-md">
                <p className="font-bold mb-2">Error Loading Submissions</p>
                <p className="text-sm opacity-80">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-4 border-red-500/30 hover:bg-red-500/10"
                >
                  Try Refreshing
                </Button>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No submissions yet</p>
              <Link href="/dashboard/write">
                <Button className="bg-[#28829E] hover:bg-teal-700">
                  Write Your First Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-6 bg-black/40 border border-white/10 rounded-xl hover:border-[#28829E]/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{submission.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(submission.status)}`}>
                          {getStatusEmoji(submission.status)} {submission.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{submission.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Category: {typeof submission.category === 'string' ? submission.category : (submission.category?.name || 'Uncategorized')}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(submission.submittedAt || submission._createdAt).toLocaleDateString()}</span>
                        {isAdmin && submission.author && (
                          <>
                            <span>•</span>
                            <span>By: {submission.author}</span>
                          </>
                        )}
                      </div>
                      {submission.reviewNotes && (
                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm text-yellow-400">
                            <strong>Editor's Note:</strong> {submission.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isAdmin && submission.status === "submitted" && (
                        <Link href={`/dashboard/review/${submission._id}`}>
                          <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/write?id=${submission._id}`}>
                        <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDelete(submission._id, submission.title)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
