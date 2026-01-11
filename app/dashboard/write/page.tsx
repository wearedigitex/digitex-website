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
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
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

  // Load existing submission if editing
  useEffect(() => {
    if (submissionId) {
      fetch(`/api/submissions/${submissionId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title)
          setSlug(data.slug.current)
          setCategory(data.category)
          setExcerpt(data.excerpt || "")
          if (data.mainImage) {
            // Reconstruct the image URL or just keep the ref
            setMainImage(data.mainImage.asset._ref)
          }
          if (editor && data.body) {
            editor.commands.setContent(data.body)
          }
        })
    }
  }, [submissionId, editor])

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview
    const reader = new FileReader()
    reader.onload = () => setMainImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setMainImage(data.assetId)
      } else {
        alert("Failed to upload image")
      }
    } catch (err) {
      console.error("Image upload error:", err)
      alert("Error uploading image")
    }
  }

  const addBodyImage = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.success && editor) {
          editor.chain().focus().setImage({ src: data.url }).run()
        }
      } catch (err) {
        console.error("Body image upload error:", err)
      }
    }
    input.click()
  }

  const handleSave = async (status: "draft" | "submitted") => {
    if (!title || !slug || !category) {
      alert("Please fill in title, slug, and category")
      return
    }

    const isSaving = status === "draft"
    isSaving ? setSaving(true) : setSubmitting(true)

    try {
      const body = editor?.getHTML() // Use HTML for Sanity-friendly storage or JSON
      
      const payload = {
        title,
        slug,
        category,
        excerpt,
        body,
        mainImage: mainImage ? {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: mainImage
          }
        } : undefined,
        status,
      }

      const response = await fetch("/api/submissions", {
        method: submissionId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionId ? { id: submissionId, ...payload } : payload),
      })

      if (response.ok) {
        alert(status === "draft" ? "Draft saved!" : "Article submitted for review!")
        router.push("/dashboard")
      } else {
        const err = await response.json()
        alert(`Failed to save: ${err.error || "Unknown error"}`)
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

            {/* Main Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Main Headline Image</label>
                <div 
                  onClick={() => document.getElementById("main-image-input")?.click()}
                  className="aspect-video bg-black/50 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#28829E]/50 transition-colors group overflow-hidden relative"
                >
                  {mainImagePreview ? (
                    <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 text-gray-600 mb-2 group-hover:text-[#28829E] transition-colors" />
                      <p className="text-sm text-gray-500">Click to upload headline image</p>
                    </>
                  )}
                  <input 
                    id="main-image-input"
                    type="file" 
                    accept="image/*" 
                    onChange={handleMainImageUpload}
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Category & Excerpt */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white rounded-lg focus:border-[#28829E] focus:outline-none h-12"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary..."
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white rounded-lg focus:border-[#28829E] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="bg-white/5 border border-white/10 rounded-t-2xl p-4 flex flex-wrap gap-2 sticky top-24 z-10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("bold") ? "text-[#28829E]" : ""}`}
          >
            <Bold className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("italic") ? "text-[#28829E]" : ""}`}
          >
            <Italic className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              className={`p-2 rounded hover:bg-white/10 ${editor.isActive("heading", { level }) ? "text-[#28829E]" : ""}`}
            >
              {level === 1 ? <Heading1 className="w-5 h-5" /> : level === 2 ? <Heading2 className="w-5 h-5" /> : <Heading3 className="w-5 h-5" />}
            </button>
          ))}
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("bulletList") ? "text-[#28829E]" : ""}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive("orderedList") ? "text-[#28829E]" : ""}`}
          >
            <ListOrdered className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={addBodyImage}
            className="p-2 rounded hover:bg-white/10"
          >
            <ImageIcon className="w-5 h-5" />
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
