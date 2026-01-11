"use client"

import { useState } from "react"
import Image from "next/image"
import { User, Users, Info, X, RefreshCw } from "lucide-react"
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
    <div className="group/card relative rounded-3xl overflow-hidden bg-[#0a0f2c] border border-white/10 hover:border-[#28829E]/50 transition-colors duration-300">
        
        {/* Card Content Container */}
        <div className="p-4 flex flex-col h-full">
            
            {/* Flip Container (Image/Bio) */}
            <div 
                className="group relative w-full aspect-square [perspective:1000px] mb-4"
                onMouseLeave={() => setIsFlipped(false)}
            >
                <div 
                className={cn(
                    "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]",
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                )}
                >
                
                {/* Front Side (Image) */}
                <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-inner bg-[#111]">
                    {member.imageUrl ? (
                    <Image 
                        src={member.imageUrl} 
                        alt={member.name} 
                        fill 
                        className="object-cover"
                    />
                    ) : (
                    <div className="flex items-center justify-center h-full">
                        <User className="w-16 h-16 text-gray-700" />
                    </div>
                    )}
                </div>

                {/* Back Side (Bio) */}
                <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-[#0F172A] p-6 flex flex-col border border-white/10">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                         <span className="text-xs font-mono text-[#28829E] uppercase tracking-wider">About</span>
                         <button 
                             onClick={(e) => {
                                 e.stopPropagation()
                                 setIsFlipped(false)
                             }}
                             className="text-gray-400 hover:text-white"
                         >
                             <X className="w-4 h-4" />
                         </button>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-900 scrollbar-track-transparent pr-1">
                        <p className="text-gray-300 text-xs leading-relaxed">
                            {member.bio || "No bio available."}
                        </p>
                    </div>
                </div>

                </div>
            </div>

            {/* Static Info Area */}
            <div className="mt-auto px-2 pb-2">
                <h3 className="text-xl font-bold text-white mb-1 group-hover/card:text-[#28829E] transition-colors">
                    {member.name}
                </h3>
                <p className="text-gray-400 text-sm mb-6">{member.role}</p>
                
                <div className="flex items-center justify-between mt-auto">
                     {/* Placeholder for social icon if valid later, keeping layout balanced */}
                     <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-[#0077b5]">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                     </div>

                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#28829E]/10 hover:bg-[#28829E]/20 text-[#28829E] text-xs font-bold uppercase tracking-wider transition-colors border border-[#28829E]/20"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5 transition-transform duration-500", isFlipped && "rotate-180")} />
                        Bio
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}
