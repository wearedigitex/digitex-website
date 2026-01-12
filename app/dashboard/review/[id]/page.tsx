"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { urlFor } from "@/lib/sanity"
import Link from "next/link"

export default function ReviewPage() {
    const router = useRouter()
    const params = useParams()
    const { data: session } = useSession()
    
    // Type assertion to access role - assuming NextAuth type augmentation or accepting 'any' for now
    const isAdmin = (session?.user as any)?.role === "admin"

    const [submission, setSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (!params.id) return

        async function loadSubmission() {
            try {
                const res = await fetch(`/api/submissions/${params.id}`)
                if (!res.ok) throw new Error("Failed to load")
                const data = await res.json()
                setSubmission(data)
            } catch (e) {
                console.error(e)
                alert("Failed to load submission")
                router.push("/dashboard")
            } finally {
                setLoading(false)
            }
        }
        loadSubmission()
    }, [params.id, router])

    const handleAction = async (status: "published" | "rejected") => {
        if (!confirm(`Are you sure you want to ${status === "published" ? "APPROVE" : "REJECT"} this article?`)) return

        setActionLoading(true)
        try {
            const res = await fetch(`/api/submissions?id=${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: params.id,
                    status
                })
            })

            if (res.ok) {
                alert(`Article ${status === "published" ? "Published" : "Rejected"}!`)
                router.push("/dashboard")
            } else {
                const err = await res.json()
                alert(`Failed: ${err.error}`)
            }
        } catch (e) {
            console.error(e)
            alert("Error processing action")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p>You must be an admin to review articles.</p>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        )
    }

    if (!submission) return null

    const mainImagePreview = submission.mainImage ? urlFor(submission.mainImage).url() : null
    const mainImageHotspot = submission.mainImage?.hotspot

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Admin Toolbar (Sticky) */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-gray-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <span className="text-sm text-gray-400 border-l border-white/10 pl-4">
                            Reviewing: <span className="text-white font-bold">{submission.title}</span>
                        </span>
                    </div>
                    <div className="flex gap-2">
                         <Button
                            onClick={() => handleAction("rejected")}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                            disabled={actionLoading}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            onClick={() => handleAction("published")}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            disabled={actionLoading}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Publish
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Preview */}
            <main className="flex-1 overflow-y-auto bg-black p-6 md:p-12">
                 <article className="max-w-4xl mx-auto">
                    {/* Category Badge */}
                    <div className="mb-4 text-center">
                        <span className="inline-block px-4 py-1 bg-[#28829E]/20 text-[#28829E] rounded-full text-sm font-bold border border-[#28829E]/30">
                            {submission.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-center">
                        {submission.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 mb-12 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                                {format(new Date(submission.submittedAt || submission._createdAt), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm">
                                {submission.author?.name || "Unknown Author"}
                            </span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {mainImagePreview && (
                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12 border border-white/10">
                            <img
                                src={mainImagePreview}
                                alt={submission.title}
                                className="w-full h-full object-cover"
                                style={{ 
                                    objectPosition: mainImageHotspot 
                                        ? `50% ${mainImageHotspot.y * 100}%` 
                                        : 'center' 
                                }}
                            />
                        </div>
                    )}

                    {/* Excerpt */}
                    {submission.excerpt && (
                        <div className="text-xl md:text-2xl font-medium text-gray-300 mb-12 leading-relaxed font-serif italic border-l-4 border-[#28829E] pl-6">
                            {submission.excerpt}
                        </div>
                    )}

                    {/* Article Body */}
                    <div className="prose prose-invert prose-lg max-w-none mb-16 mx-auto">
                        <div dangerouslySetInnerHTML={{ __html: submission.bodyHtml || "<p>No content.</p>" }} />
                    </div>
                </article>
            </main>
        </div>
    )
}
