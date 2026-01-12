"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare, Send, ShieldCheck, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentItem } from "./comment-item"

interface Comment {
  _id: string
  name: string
  content: string // Map 'comment' from API to this
  createdAt: string
  isTeamMember?: boolean
  parentCommentId?: string
}

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", comment: "", verificationCode: "" })
  const [status, setStatus] = useState<"idle" | "success" | "pending" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Logic State
  const [showVerification, setShowVerification] = useState(false)
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null) // For delete modal
  const [deleteEmail, setDeleteEmail] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      if (res.ok) {
        const data = await res.json()
        // Map 'comment' to 'content' for consistency if needed, but API returns 'comment'
        const mappedData = data.map((c: any) => ({
            ...c,
            content: c.comment 
        }))
        setComments(mappedData)
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

  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes("@")) return

    try {
      const response = await fetch("/api/check-team-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await response.json()
      if (data.isTeamMember) {
        setShowVerification(true)
      } else {
        setShowVerification(false)
        setFormData(prev => ({ ...prev, verificationCode: "" }))
      }
    } catch (e) {
      console.error("Failed to check team status", e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus("idle")
    setErrorMessage(null)

    try {
      const payload = {
          postId,
          ...formData,
          parentCommentId: activeReplyId
      }

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus(data.approved ? "success" : "pending")
        setFormData({ name: "", email: "", comment: "", verificationCode: "" })
        setShowVerification(false)
        setActiveReplyId(null) // Close reply form
        
        if (data.approved) {
           fetchComments() // Refresh immediately if auto-approved
        }
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong.")
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
      setStatus("error")
      setErrorMessage("Failed to submit comment.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !deleteEmail) return
    setIsDeleting(true)

    try {
        const res = await fetch("/api/comments", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentId: deleteId, email: deleteEmail })
        })

        const data = await res.json()

        if (res.ok) {
            setDeleteId(null)
            setDeleteEmail("")
            fetchComments()
        } else {
            alert(data.error || "Failed to delete comment")
        }
    } catch (error) {
        console.error("Delete failed", error)
        alert("Failed to delete comment")
    } finally {
        setIsDeleting(false)
    }
  }

  // Reusable Form Component
  const renderForm = (isReply: boolean = false) => (
    <div className={isReply ? "bg-[#111] p-6 rounded-2xl border border-white/10 mt-4" : "bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 mb-16 shadow-2xl"}>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{isReply ? "Reply to Comment" : "Leave a Comment"}</h3>
            {isReply && (
                <button onClick={() => setActiveReplyId(null)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
        
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
            onBlur={handleEmailBlur}
            className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-[#28829E] transition-all"
            placeholder="john@example.com"
          />
        </div>
      </div>
      
      {showVerification && (
        <div className="space-y-4 rounded-xl border border-[#28829E]/30 bg-[#28829E]/5 p-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#28829E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Team Verification
            </label>
          </div>
          <p className="text-xs text-gray-400">
            We recognized this email as a team member address! Please enter your secret code to verify your identity.
          </p>
          <input
            type="password"
            placeholder="Enter your secret team code"
            value={formData.verificationCode || ""}
            onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
            className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-[#28829E] transition-all"
          />
        </div>
      )}

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
            <span className="text-sm font-medium">Comment posted successfully!</span>
          </div>
        )}
         {status === "pending" && (
          <div className="flex items-center gap-2 text-yellow-400 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Comment submitted for moderation.</span>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{errorMessage || "Something went wrong."}</span>
          </div>
        )}
      </div>
    </form>
    </div>
  )

  const rootComments = comments.filter(c => !c.parentCommentId)

  return (
    <section className="mt-16 border-t border-white/10 pt-16 relative">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-[#28829E]/10 flex items-center justify-center border border-[#28829E]/20">
          <MessageSquare className="w-5 h-5 text-[#28829E]" />
        </div>
        <h2 className="text-3xl font-bold">Comments</h2>
        <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">
          {comments.length}
        </span>
      </div>

      {/* Main Comment Form */}
      {!activeReplyId && renderForm(false)}

      {/* Comments List */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-400">No comments yet. Be the first to join the conversation!</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem 
                key={comment._id}
                comment={comment}
                allComments={comments}
                postId={postId}
                onReply={setActiveReplyId}
                onDelete={setDeleteId}
                activeReplyId={activeReplyId}
                replyForm={renderForm(true)}
            />
          ))
        )}
      </div>

      {/* Delete Verification Modal */}
      {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                      <Trash2 className="w-5 h-5" />
                      Delete Thread?
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm">
                      This will permanently delete this comment and all its replies. 
                      Please enter the email address used to post this comment to verify ownership.
                  </p>
                  
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-red-500 transition-all mb-6"
                   />

                   <div className="flex justify-end gap-3">
                       <Button variant="ghost" onClick={() => { setDeleteId(null); setDeleteEmail(""); }}>
                           Cancel
                       </Button>
                       <Button 
                        onClick={handleDelete}
                        disabled={isDeleting || !deleteEmail}
                        className="bg-red-500 hover:bg-red-600 text-white"
                       >
                           {isDeleting ? "Deleting..." : "Delete Permanently"}
                       </Button>
                   </div>
              </div>
          </div>
      )}
    </section>
  )
}
