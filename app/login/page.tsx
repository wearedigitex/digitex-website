"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Lock, Hexagon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroScene } from "@/components/canvas/hero-scene"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("Attempting login with:", username, password)

    // Simulate API delay
    setTimeout(() => {
      // Trim inputs to avoid whitespace issues
      if (username.trim() === "iraj.gupta22@gmail.com" && password.trim() === "124ipnyGup") {
        console.log("Login successful, redirecting...")
        router.push("/dashboard")
      } else {
        console.log("Login failed")
        setError("Invalid credentials. Please check your username and password.")
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <main className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <HeroScene />
      
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10">
        <div className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden group">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 border border-[#0EA5E9]/50 rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.15)] pointer-events-none"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#28829E] to-[#0EA5E9] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 transform rotate-45">
               <Hexagon className="w-8 h-8 text-white transform -rotate-45" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2 text-sm">Access your Digitex account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-[#0EA5E9] transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg h-11 pl-10 text-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all placeholder:text-gray-700"
                  placeholder="Enter username"
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
                  className="w-full bg-[#111] border border-white/10 rounded-lg h-11 pl-10 text-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all placeholder:text-gray-700"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <Button disabled={loading} className="w-full bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-bold h-12 rounded-lg mt-6 shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all">
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-xs text-gray-500 hover:text-[#0EA5E9] transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
