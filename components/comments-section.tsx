"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare, Send, User, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  _id: string
  name: string
  comment: string
  createdAt: string
}

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", comment: "" })
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus("idle")

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, ...formData }),
      })

      if (res.ok) {
        setStatus("success")
        setFormData({ name: "", email: "", comment: "" })
        // We don't fetch again because the comment is likely pending approval
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
      setStatus("error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 border-t border-white/10 pt-16">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-[#28829E]/10 flex items-center justify-center border border-[#28829E]/20">
          <MessageSquare className="w-5 h-5 text-[#28829E]" />
        </div>
        <h2 className="text-3xl font-bold">Comments</h2>
        <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">
          {comments.length}
        </span>
      </div>

      {/* Comment Form */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 mb-16 shadow-2xl">
        <h3 className="text-xl font-bold mb-6">Leave a Comment</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-[#28829E] transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-[#28829E] transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Comment</label>
            <textarea
              required
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl h-32 p-4 text-white focus:outline-none focus:border-[#28829E] transition-all resize-none"
              placeholder="What are your thoughts?"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button
              disabled={submitting}
              className="h-12 px-8 bg-[#28829E] hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2"
            >
              {submitting ? "Posting..." : "Post Comment"}
              <Send className="w-4 h-4" />
            </Button>

            {status === "success" && (
              <div className="flex items-center gap-2 text-green-400 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Comment submitted for moderation!</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Something went wrong. Try again.</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-400">No comments yet. Be the first to join the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="group relative flex gap-6 p-6 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                <User className="w-6 h-6 text-[#28829E]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">{comment.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
