"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  ArrowLeft, Save, Send, Image as ImageIcon
} from "lucide-react"

const CATEGORIES = ["TECHNOLOGY", "MEDICINE", "COMMERCE", "GENERAL"]

import { Suspense } from "react"

function WritePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const submissionId = searchParams.get("id")

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("TECHNOLOGY")
  const [excerpt, setExcerpt] = useState("")
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "<p>Start writing your article...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-6",
      },
    },
  })

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !submissionId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setSlug(generatedSlug)
    }
  }, [title, submissionId])

  // Load existing submission if editing
  useEffect(() => {
    if (submissionId) {
      // Fetch submission data
      fetch(`/api/submissions/${submissionId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title)
          setSlug(data.slug.current)
          setCategory(data.category)
          setExcerpt(data.excerpt || "")
          if (editor && data.body) {
            editor.commands.setContent(data.body)
          }
        })
    }
  }, [submissionId, editor])

  const handleSave = async (status: "draft" | "submitted") => {
    if (!title || !slug || !category) {
      alert("Please fill in title, slug, and category")
      return
    }

    const isSaving = status === "draft"
    isSaving ? setSaving(true) : setSubmitting(true)

    try {
      const body = editor?.getJSON()
      
      const payload = {
        title,
        slug,
        category,
        excerpt,
        body,
        status,
      }

      const url = submissionId ? "/api/submissions" : "/api/submissions"
      const method = submissionId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionId ? { id: submissionId, ...payload } : payload),
      })

      if (response.ok) {
        alert(status === "draft" ? "Draft saved!" : "Article submitted for review!")
        router.push("/dashboard")
      } else {
        alert("Failed to save article")
      }
    } catch (error) {
      console.error("Error saving article:", error)
      alert("An error occurred")
    } finally {
      setSaving(false)
      setSubmitting(false)
    }
  }

  if (!editor) {
    return <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">Loading editor...</div>
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleSave("draft")}
              disabled={saving || submitting}
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={() => handleSave("submitted")}
              disabled={saving || submitting}
              className="bg-[#28829E] hover:bg-teal-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </div>

        {/* Article Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="bg-black/50 border-white/10 text-white text-2xl font-bold h-14"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Slug (URL)</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-url-slug"
                className="bg-black/50 border-white/10 text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white rounded-lg focus:border-[#28829E] focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt (Optional)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of your article..."
                rows={3}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white rounded-lg focus:border-[#28829E] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="bg-white/5 border border-white/10 rounded-t-2xl p-4 flex flex-wrap gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("bold") ? "bg-[#28829E]" : ""}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("italic") ? "bg-[#28829E]" : ""}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("heading", { level: 1 }) ? "bg-[#28829E]" : ""}`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("heading", { level: 2 }) ? "bg-[#28829E]" : ""}`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("heading", { level: 3 }) ? "bg-[#28829E]" : ""}`}
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("bulletList") ? "bg-[#28829E]" : ""}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("orderedList") ? "bg-[#28829E]" : ""}`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="bg-white/5 border border-white/10 border-t-0 rounded-b-2xl">
          <EditorContent editor={editor} />
        </div>
      </div>
    </main>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">Loading editor...</div>}>
      <WritePageContent />
    </Suspense>
  )
}
