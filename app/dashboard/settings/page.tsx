"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Lock, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setError(data.error || "Failed to update password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(true)
      // Small delay for UX
      setTimeout(() => setLoading(false), 500)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Security Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Security</h2>
                <p className="text-gray-400">Manage your password and account protection</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 bg-black/50 border-white/10 focus:border-[#28829E]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 focus:border-[#28829E]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 focus:border-[#28829E]"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#28829E] hover:bg-teal-700 h-12"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </section>

          {/* Account Info (Read-only for now) */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 opacity-60">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Profile Info</h2>
                <p className="text-gray-400">Account details (Managed by Admin)</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic">
              Please contact an administrator to change your email or role.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
