"use client"

import { useState } from "react"
import Image from "next/image"
import { User, Users, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMember {
  _id: string
  name: string
  role: string
  imageUrl?: string
  bio?: string
}

interface TeamCardProps {
  member: TeamMember
}

export function TeamCard({ member }: TeamCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="flex flex-col gap-4 mt-8 group/card">
      {/* Flip Container (Image/Bio) */}
      <div 
        className="group relative w-full aspect-square [perspective:1000px]"
        onMouseLeave={() => setIsFlipped(false)} // Optional: Auto-close on mouse leave? Maybe not if it's a click interaction. Let's keep it manual for now or remove if annoying.
      >
        <div 
          className={cn(
            "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]",
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          )}
        >
          
          {/* Front Side (Image) */}
          <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-[#111]">
            {member.imageUrl ? (
              <Image 
                src={member.imageUrl} 
                alt={member.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                 <User className="w-16 h-16 text-gray-700" />
              </div>
            )}
            
            {/* Bio Toggle Button (Front) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped(true)
              }}
              className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-[#28829E] transition-colors border border-white/10 group-hover/card:scale-110"
              aria-label="View Bio"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Back Side (Bio) */}
          <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-[#0A0A0A] border border-[#28829E]/50 p-6 flex flex-col shadow-[0_0_30px_rgba(40,130,158,0.2)]">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#28829E]/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#28829E]" />
                 </div>
                 <span className="text-xs font-mono text-[#28829E] uppercase tracking-wider">Bio</span>
               </div>
               
               {/* Close Button */}
               <button 
                 onClick={(e) => {
                   e.stopPropagation()
                   setIsFlipped(false)
                 }}
                 className="text-gray-400 hover:text-white transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-900 scrollbar-track-transparent pr-2">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {member.bio || "No bio available."}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Static Info (Name/Role) */}
      <div className="text-left px-1">
        <h3 className="text-xl font-bold text-white leading-tight group-hover/card:text-[#28829E] transition-colors">
          {member.name}
        </h3>
        <p className="text-gray-400 text-sm mt-1">{member.role}</p>
      </div>
    </div>
  )
}
