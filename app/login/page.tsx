"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ArrowLeft, User, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { HeroScene } from "@/components/canvas/hero-scene"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <HeroScene />
      
      {/* Back Button */}
      <div className="absolute top-24 left-8 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-lg p-6 flex flex-col justify-center min-h-screen">
        <div className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden group">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 border border-[#0EA5E9]/50 rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.15)] pointer-events-none"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
               <Image 
                 src="/DigitexLogo.png" 
                 alt="Digitex Logo" 
                 fill 
                 className="object-contain"
               />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Access your Digitex account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-[#0EA5E9] transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-white/10 rounded-lg h-11 pl-10 text-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all placeholder:text-gray-700"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-[#0EA5E9] transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-white/10 rounded-lg h-11 pl-10 text-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all placeholder:text-gray-700"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading} 
              className="w-full bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-bold h-12 rounded-lg mt-6 shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all"
            >
              {loading ? "PROCESSING..." : "LOGIN"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              New contributor? Ask an admin for an invitation.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
