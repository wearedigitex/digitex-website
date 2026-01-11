"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Send, CheckCircle, XCircle } from "lucide-react"

export function InviteUserForm() {
  const [email, setEmail] = useState("")
  const [authors, setAuthors] = useState<any[]>([])
  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Fetch authors from Sanity
    fetch("/api/authors")
      .then(res => res.json())
      .then(data => setAuthors(data))
      .catch(err => console.error("Failed to load authors:", err))
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          authorId: selectedAuthor,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || `Invitation sent to ${email}!`)
        if (data.tempPassword) {
          (window as any)._tempPass = data.tempPassword;
        }
        setEmail("")
        setSelectedAuthor("")
      } else {
        setStatus("error")
        const errorDetail = data.details ? ` (${data.details})` : "";
        setMessage((data.error || "Failed to send invitation") + errorDetail)
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Invite Team Member</h2>
      
      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contributor@example.com"
              required
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link to Author Profile
          </label>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#28829E]"
          >
            <option value="">Select an author...</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name} - {author.role}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#28829E] hover:bg-teal-700 text-white"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </>
          )}
        </Button>
      </form>

      {status !== "idle" && (
        <div className={`mt-4 p-4 rounded-lg flex flex-col gap-2 ${
          status === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            {status === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">{message}</span>
          </div>
          
          {/* Show temp password if email failed but user was created */}
          {status === "success" && (message.includes("failed") || message.includes("manually")) && (
            <div className="mt-2 p-3 bg-white/50 rounded border border-green-300">
              <p className="text-xs text-green-700 mb-1 font-bold italic">Manual Credentials:</p>
              <code className="text-xs bg-black/10 px-2 py-1 rounded block select-all">
                Password: {(window as any)._tempPass || "Check logs"}
              </code>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The invited user will receive an email with their login credentials. 
          They should change their password after first login.
        </p>
      </div>
    </div>
  )
}
