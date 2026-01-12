"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenSquare, FileText, LogOut, Settings, Eye, LayoutDashboard, Database } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = (session?.user as any)?.role === "admin"

  useEffect(() => {
    async function loadData() {
      try {
        // This will be populated by the session
        const response = await fetch("/api/submissions")
        const data = await response.json()
        setSubmissions(data)
      } catch (error) {
        console.error("Failed to load submissions:", error)
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
    return colors[status] || colors.draft
  }

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      draft: "📝",
      submitted: "📤",
      approved: "✅",
      rejected: "❌",
      published: "🚀",
    }
    return emojis[status] || "📄"
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
              {submissions.filter(s => s.status === "published").length}
            </h3>
            <p className="text-gray-400">Published Articles</p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Your Submissions</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
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
                        <span>Category: {submission.category}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(submission.submittedAt || submission._createdAt).toLocaleDateString()}</span>
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
