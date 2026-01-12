
"use client"

import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface LikeButtonProps {
  postId: string
  initialLikes: number
  className?: string
}

export function LikeButton({ postId, initialLikes, className }: LikeButtonProps) {
  // State
  const [likes, setLikes] = useState(Math.max(0, initialLikes))
  const [hasLiked, setHasLiked] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Ref for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load initial state from localStorage and ensure synchronization with server prop
  useEffect(() => {
    // Check localStorage for user interaction history
    const storageKey = `digitex_blog_liked_${postId}`
    const storedLike = localStorage.getItem(storageKey) === "true"
    
    setHasLiked(storedLike)

    // If local says liked, but server says 0, assume server is stale/lagging and we are the first like.
    // This fixes the navigation sync issue for fresh likes.
    if (storedLike && initialLikes === 0) {
      setLikes(1)
    } else {
      setLikes(Math.max(0, initialLikes))
    }
  }, [postId, initialLikes])

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a Link
    e.stopPropagation()

    // Determine new state
    const newHasLiked = !hasLiked
    // If we are liking, add 1. If unliking, subtract 1 but don't go below 0.
    // We use the `likes` state as the base.
    const newLikes = newHasLiked ? likes + 1 : Math.max(0, likes - 1)

    // Optimistic Update
    setHasLiked(newHasLiked)
    setLikes(newLikes)
    
    // Update LocalStorage immediately
    const storageKey = `digitex_blog_liked_${postId}`
    if (newHasLiked) {
        localStorage.setItem(storageKey, "true")
    } else {
        localStorage.removeItem(storageKey)
    }

    // Debounce API Call
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
        setIsUpdating(true)
        try {
            const res = await fetch("/api/likes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    postId, 
                    increment: newHasLiked 
                }),
            })

            if (!res.ok) throw new Error("Failed to update likes")
        } catch (error) {
            console.error("Like update failed", error)
            // Revert on failure
            setHasLiked(!newHasLiked)
            setLikes(likes) // Revert to previous count
             if (!newHasLiked) { // If we tried to like and failed, remove key
                 localStorage.removeItem(storageKey)
             } else { // If we tried to unlike and failed, add key back
                 localStorage.setItem(storageKey, "true")
             }
        } finally {
            setIsUpdating(false)
        }
    }, 1000) // 1 second debounce
  }

  return (
    <Button
       variant="ghost" 
       size="sm" 
       onClick={handleToggleLike}
       className={cn(
         "group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-[#28829E]/10",
         hasLiked ? "text-[#28829E] bg-[#28829E]/10" : "text-gray-400 hover:text-[#28829E]",
         className
       )}
    >
      <Heart 
        className={cn(
            "w-4 h-4 transition-all duration-300",
            hasLiked ? "fill-[#28829E] scale-110" : "group-hover:scale-110"
        )} 
      />
      <span className={cn(
        "text-sm font-bold tabular-nums",
        hasLiked && "text-[#28829E]"
      )}>
        {Math.max(0, likes)}
      </span>
    </Button>
  )
}
