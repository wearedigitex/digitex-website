"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Clock, MessageSquare, Reply, Trash2, ShieldCheck, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Comment {
  _id: string
  name: string
  content: string // Note: API returns 'comment' field, mapped to this
  createdAt: string
  isTeamMember?: boolean
  parentCommentId?: string
}

interface CommentItemProps {
  comment: Comment
  allComments: Comment[]
  postId: string
  level?: number
  onReply: (parentId: string) => void
  onDelete: (commentId: string) => void
  activeReplyId: string | null
  replyForm: React.ReactNode
}

export function CommentItem({ 
  comment, 
  allComments, 
  postId, 
  level = 0,
  onReply,
  onDelete,
  activeReplyId,
  replyForm
}: CommentItemProps) {
  // Find replies to this comment
  const replies = allComments
    .filter(c => c.parentCommentId === comment._id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const isReply = level > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn("flex flex-col gap-4", level > 0 && "mt-4")}
    >
      <div className={cn(
        "group relative flex gap-4 p-5 rounded-2xl transition-all border border-transparent hover:border-white/10",
        isReply ? "bg-white/5 ml-8 md:ml-12" : "bg-[#0A0A0A] border-white/5"
      )}>
        {/* Connector Line for Replies */}
        {isReply && (
          <div className="absolute -left-6 top-8 w-6 h-[2px] bg-white/10 rounded-full" />
        )}

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 flex-shrink-0">
          <User className="w-5 h-5 text-[#28829E]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-white text-base truncate">{comment.name}</h4>
              {comment.isTeamMember && (
                <span className="px-2 py-0.5 rounded-full bg-[#28829E]/20 border border-[#28829E]/30 text-[#28829E] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  TEAM
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm mb-4">
            {comment.content}
          </p>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onReply(comment._id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#28829E] transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>

            {/* Delete button for everyone (either instant for team or request for visitors) */}
            <button 
              onClick={() => onDelete(comment._id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-400 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {comment.isTeamMember ? "Thread" : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Reply Form Injection */}
      <AnimatePresence>
        {activeReplyId === comment._id && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={cn("overflow-hidden", isReply ? "ml-8 md:ml-12" : "")}
            >
                {replyForm}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Recursive Replies */}
      {replies.length > 0 && (
        <div className="flex flex-col gap-4">
          {replies.map(reply => (
            <CommentItem 
              key={reply._id}
              comment={reply}
              allComments={allComments}
              postId={postId}
              level={level + 1}
              onReply={onReply}
              onDelete={onDelete}
              activeReplyId={activeReplyId}
              replyForm={replyForm}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
