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
  ArrowLeft, Save, Send, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Maximize, Minimize, Eye, CheckCircle, XCircle
} from "lucide-react"

import { useSession } from "next-auth/react"
import { ArticlePreviewModal } from "@/components/article-preview-modal"

const CATEGORIES = ["TECHNOLOGY", "MEDICINE", "COMMERCE", "GENERAL"]

import { urlFor } from "@/lib/sanity"
import { Suspense } from "react"

const CustomImage = Image.extend({
  name: 'image',
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
        }),
      },
      align: {
        default: 'center',
        renderHTML: attributes => {
          const styles: Record<string, string> = {
            left: 'float: left; margin-right: 2rem; margin-bottom: 1.5rem; max-width: 50%;',
            right: 'float: right; margin-left: 2rem; margin-bottom: 1.5rem; max-width: 50%;',
            center: 'display: block; margin: 2.5rem auto; width: 100%;',
          }
          return {
            'data-align': attributes.align,
            style: styles[attributes.align] || styles.center,
          }
        },
      },
    }
  },
})

function WritePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const submissionId = searchParams.get("id")

  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "admin"

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("TECHNOLOGY")
  const [excerpt, setExcerpt] = useState("")
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [mainImageHotspot, setMainImageHotspot] = useState({ x: 0.5, y: 0.5 })
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [, setUpdate] = useState(0)
  const editor = useEditor({
    extensions: [StarterKit, CustomImage],
    content: "<p>Start writing your article...</p>",
    immediatelyRender: false,
    onTransaction: () => {
      // Force re-render on any editor state change
      setUpdate(s => s + 1)
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-6 article-content",
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
      fetch(`/api/submissions/${submissionId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title)
          // Handle both structured slug and legacy/corrupted string slug
          const slugValue = typeof data.slug === "string" ? data.slug : data.slug?.current || ""
          setSlug(slugValue)
          setCategory(data.category)
          setExcerpt(data.excerpt || "")
          if (data.mainImage) {
            setMainImage(data.mainImage.asset._ref)
            setMainImagePreview(urlFor(data.mainImage).url())
            if (data.mainImage.hotspot) {
              setMainImageHotspot(data.mainImage.hotspot)
            }
          }
          if (editor) {
            if (data.bodyHtml) {
              editor.commands.setContent(data.bodyHtml)
            } else if (data.body) {
              editor.commands.setContent(data.body)
            }
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

  const addBodyImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Insert loading placeholder text
      const loadingText = `[UPLOADING_IMAGE_${Date.now()}]`
      if (editor) {
        editor.chain().focus().insertContent(loadingText).run()
      }

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        
        if (data.success && editor) {
          const content = editor.getHTML()
          const newContent = content.replace(loadingText, `<img src="${data.url}" />`)
          editor.commands.setContent(newContent)
          editor.commands.focus()
        } else {
          // Remove placeholder on error
          if (editor) {
            const content = editor.getHTML()
            const newContent = content.replace(loadingText, "")
            editor.commands.setContent(newContent)
          }
          alert(`Failed to upload image: ${data.error || "Unknown error"}`)
        }
      } catch (err) {
        if (editor) {
          const content = editor.getHTML()
          const newContent = content.replace(loadingText, "")
          editor.commands.setContent(newContent)
        }
        alert("Error uploading image. Please try again.")
      }
    }
    input.click()
  }

  const handleSave = async (status: "draft" | "submitted" | "published" | "rejected") => {
    if (!title || !slug || !category) {
      alert("Please fill in title, slug, and category")
      return
    }

    const isSaving = status === "draft"
    isSaving ? setSaving(true) : setSubmitting(true)

    try {
      const bodyHtml = editor?.getHTML()
      
      const payload = {
        title,
        slug: { _type: "slug", current: slug },
        category,
        excerpt,
        bodyHtml,
        mainImage: mainImage ? {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: mainImage
          },
          hotspot: {
            _type: "sanity.imageHotspot",
            x: mainImageHotspot.x,
            y: mainImageHotspot.y,
            height: 1,
            width: 1
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
        let msg = "Saved!"
        if (status === "draft") msg = "Draft saved!"
        if (status === "submitted") msg = "Submitted for review!"
        if (status === "published") msg = "Article Published!"
        if (status === "rejected") msg = "Article Rejected."
        
        alert(msg)
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
            {submissionId && (
                <Button
                    onClick={async () => {
                        if (!confirm("Are you sure you want to delete this draft? This cannot be undone.")) return
                        
                        try {
                            const res = await fetch(`/api/submissions/${submissionId}`, { method: "DELETE" })
                            if (res.ok) {
                                router.push("/dashboard")
                            } else {
                                alert("Failed to delete draft")
                            }
                        } catch (e) {
                            alert("Error deleting draft")
                        }
                    }}
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                >
                    Delete Draft
                </Button>
            )}
            <Button
              onClick={() => setPreviewOpen(true)}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            {isAdmin && submissionId ? (
                <>
                    <Button
                        onClick={() => handleSave("rejected")}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                        disabled={saving || submitting}
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                    </Button>
                    <Button
                        onClick={() => handleSave("published")}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={saving || submitting}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Publish
                    </Button>
                </>
            ) : (
                <>
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
                </>
            )}
          </div>
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
                <div className="flex gap-4">
                  <div 
                    onClick={() => document.getElementById("main-image-input")?.click()}
                    className="flex-1 aspect-video bg-black/50 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#28829E]/50 transition-colors group overflow-hidden relative"
                  >
                    {mainImagePreview ? (
                      <img 
                        src={mainImagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        style={{ objectPosition: `50% ${mainImageHotspot.y * 100}%` }}
                      />
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

                  {/* Positioning Slider */}
                  {mainImagePreview && (
                    <div className="flex flex-col items-center gap-2">
                       <label className="text-[10px] uppercase font-bold text-gray-500 vertical-text">Position</label>
                       <div className="relative h-full w-8 bg-black/50 border border-white/10 rounded-lg flex flex-col justify-between py-2 items-center">
                         <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={mainImageHotspot.y}
                          onChange={(e) => setMainImageHotspot(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                          className="h-full w-1 accent-[#28829E] appearance-none bg-white/10 rounded-full cursor-ns-resize"
                          style={{ writingMode: 'bt-lr', appearance: 'slider-vertical' } as any}
                         />
                       </div>
                    </div>
                  )}
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

          {/* Image Alignment & Size (Visible when image selected) */}
          {editor.isActive('image') && (
             <>
              <div className="w-px h-8 bg-white/10 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.getAttributes('image').align === 'left' ? "text-[#28829E]" : ""}`}
                title="Align Left"
              >
                <AlignLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.getAttributes('image').align === 'center' || !editor.getAttributes('image').align ? "text-[#28829E]" : ""}`}
                title="Align Center"
              >
                <AlignCenter className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.getAttributes('image').align === 'right' ? "text-[#28829E]" : ""}`}
                title="Align Right"
              >
                <AlignRight className="w-5 h-5" />
              </button>
              
              <div className="w-px h-8 bg-white/10 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()}
                className={`p-1 text-[10px] font-bold rounded hover:bg-white/10 ${editor.getAttributes('image').width === '25%' ? "text-[#28829E]" : ""}`}
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
                className={`p-1 text-[10px] font-bold rounded hover:bg-white/10 ${editor.getAttributes('image').width === '50%' ? "text-[#28829E]" : ""}`}
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
                className={`p-1 text-[10px] font-bold rounded hover:bg-white/10 ${editor.getAttributes('image').width === '100%' || !editor.getAttributes('image').width ? "text-[#28829E]" : ""}`}
              >
                100%
              </button>
             </>
          )}
        </div>

        {/* Editor Content */}
        <div className="bg-white/5 border border-white/10 border-t-0 rounded-b-2xl">
          <EditorContent editor={editor} />
        </div>
      </div>

      <ArticlePreviewModal 
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={{
            title,
            category,
            excerpt,
            bodyHtml: editor?.getHTML() || "",
            mainImagePreview,
            mainImageHotspot,
            authorName: session?.user?.name || "You",
            date: new Date()
        }}
      />
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
