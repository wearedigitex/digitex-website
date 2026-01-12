"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

import Image from "next/image"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // SPA Links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#foundation", label: "Foundation" }, // Section
    { href: "/#team", label: "Team" }, // Section
    { href: "/blog", label: "Blog" }, // Page
    { href: "/#contact", label: "Contact" }, // Section
  ]

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto",
          scrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
             <div className="flex items-center gap-3">
               <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                 <Image 
                   src="/DigitexLogo.png" 
                   alt="Digitex Logo" 
                   fill 
                   className="object-contain"
                 />
               </div>
               <span className="font-bold text-2xl tracking-tight text-white">Digite<span className="text-[#28829E]">X</span></span>
             </div>
          </Link>

          {/* Desktop Nav Links - Centered Absolutely */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isBlog = link.label === "Blog"
              
              if (isBlog) {
                return (
                   <Link 
                    key={link.href} 
                    href={link.href}
                    className="relative group px-4 py-2 rounded-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[#28829E]/10 group-hover:bg-[#28829E]/20 transition-colors duration-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform duration-1000" />
                    <span className="relative z-10 text-sm font-bold text-[#28829E] group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                    <div className="absolute inset-0 rounded-full ring-1 ring-[#28829E]/30 group-hover:ring-[#28829E]/60 transition-all" />
                  </Link>
                )
              }

              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative",
                     "text-[#CCCCCC] hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Login Button */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 text-white rounded-lg font-bold px-6 h-10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white rounded-lg font-bold px-6 h-10 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-black/95 pointer-events-auto pt-24 px-6"
          >
             <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="absolute top-6 right-6 text-white"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="flex flex-col gap-6 items-center text-center">
                {navLinks.map((link) => (
                   <Link 
                    key={link.href}
                    href={link.href}
                    className="text-2xl font-bold text-gray-300 hover:text-[#28829E] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                   >
                     {link.label}
                   </Link>
                ))}
                
                <div className="h-px w-20 bg-white/10 my-4" />
                
                {session ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-2xl font-bold text-gray-300 hover:text-[#28829E] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Button 
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut()
                      }}
                      variant="outline"
                      className="w-full border-white/20 text-white rounded-lg h-12 text-lg px-12"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#0EA5E9] text-white rounded-lg h-12 text-lg px-12">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
