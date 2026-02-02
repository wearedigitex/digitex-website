"use client"

import { useState } from "react"
import Image from "next/image"
import { User, Users, Info, X, RefreshCw, Linkedin, Instagram, Github } from "lucide-react"
import { cn } from "@/lib/utils"

import { urlFor } from "@/lib/sanity"
import { getObjectPosition } from "@/lib/utils"

interface TeamMember {
    _id: string
    name: string
    role: string
    imageUrl?: string
    image?: any
    bio?: string
    linkedin?: string
    instagram?: string
    github?: string
}

interface TeamCardProps {
    member: TeamMember
}

export function TeamCard({ member }: TeamCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)

    const displayImageUrl = member.image ? urlFor(member.image).url() : member.imageUrl

    return (
        <div className="group/card relative rounded-2xl overflow-hidden bg-[#0a0f2c] border border-white/5 hover:border-[#28829E]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(40,130,158,0.1)]">

            {/* Card Content Container */}
            <div className="p-3 flex flex-col h-full">

                {/* Flip Container (Image/Bio) */}
                <div
                    className="group relative w-full aspect-[4/5] [perspective:1000px] mb-3"
                    onMouseLeave={() => setIsFlipped(false)}
                >
                    <div
                        className={cn(
                            "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]",
                            isFlipped ? "[transform:rotateY(180deg)]" : ""
                        )}
                    >

                        {/* Front Side (Image) */}
                        <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] rounded-xl overflow-hidden shadow-inner bg-[#111]">
                            {member.image ? (
                                <Image
                                    src={urlFor(member.image).width(400).height(500).auto('format').url()}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                    style={{ objectPosition: getObjectPosition(member.image?.hotspot) }}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            ) : displayImageUrl ? (
                                <Image
                                    src={displayImageUrl}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <User className="w-12 h-12 text-gray-800" />
                                </div>
                            )}
                        </div>

                        {/* Back Side (Bio) */}
                        <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl bg-[#0F172A] p-4 flex flex-col border border-white/10">
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                                <span className="text-[10px] font-mono text-[#28829E] uppercase tracking-widest">About</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsFlipped(false)
                                    }}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-900 scrollbar-track-transparent pr-1">
                                <p className="text-gray-400 text-[11px] leading-relaxed">
                                    {member.bio || "No bio available."}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Static Info Area */}
                <div className="px-1">
                    <h3 className="text-lg font-bold text-white mb-0.5 group-hover/card:text-[#28829E] transition-colors line-clamp-1">
                        {member.name}
                    </h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-1">{member.role}</p>

                    <div className="flex items-center justify-between mt-auto w-full pt-1">
                        <div className="flex items-center gap-2">
                            {/* Social Icons */}
                            {member.linkedin && (
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all shadow-sm"
                                    title="LinkedIn"
                                >
                                    <Linkedin className="w-3.5 h-3.5" />
                                </a>
                            )}

                            {member.instagram && (
                                <a
                                    href={member.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all shadow-sm"
                                    title="Instagram"
                                >
                                    <Instagram className="w-3.5 h-3.5" />
                                </a>
                            )}

                            {member.github && (
                                <a
                                    href={member.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 text-white hover:bg-[#333] hover:text-white transition-all shadow-sm"
                                    title="GitHub"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>

                        <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#28829E]/5 hover:bg-[#28829E]/20 text-[#28829E] text-[10px] font-bold uppercase tracking-wider transition-all border border-[#28829E]/10"
                        >
                            <RefreshCw className={cn("w-3 h-3 transition-transform duration-500", isFlipped && "rotate-180")} />
                            Bio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
