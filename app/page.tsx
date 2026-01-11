"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Zap, Globe, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagneticButton } from "@/components/magnetic-button"
import { HeroScene } from "@/components/canvas/hero-scene"
import { Orb } from "@/components/ui/orb"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { getTeamMembers } from "@/lib/sanity"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await getTeamMembers()
        setTeamMembers(data)
      } catch (error) {
        console.error("Failed to load team:", error)
      }
    }
    loadTeam()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })

      if (res.ok) {
        setSubmitStatus("success")
        setFormState({ name: "", email: "", message: "" })
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Text Stagger
      gsap.from(".hero-text-item", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out"
      })

      // Section Animations
      gsap.from(".foundation-card", {
        scrollTrigger: {
          trigger: "#foundation",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1
      })
    }, heroRef)
    
    return () => ctx.revert()
  }, [])

  // Group members by department for organized display
  const leardership = teamMembers.filter(m => m.department === "Leadership")
  const techTeam = teamMembers.filter(m => m.department === "Department of Technology")
  const medTeam = teamMembers.filter(m => m.department === "Department of Medicine")
  const commTeam = teamMembers.filter(m => m.department === "Department of Commerce")

  const renderTeamGrid = (members: any[], title: string) => (
    <div className="mb-16 last:mb-0">
      <h3 className="text-2xl font-bold mb-8 text-[#28829E] border-l-4 border-[#28829E] pl-4">{title}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member) => (
           <div key={member._id} className="group relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/5 aspect-[4/5] hover:shadow-[0_0_30px_rgba(40,130,158,0.2)] transition-shadow">
             {member.imageUrl ? (
               <Image 
                 src={member.imageUrl} 
                 alt={member.name} 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-700"
               />
             ) : (
                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                   <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 mb-4 mx-auto opacity-80 blur-xl group-hover:blur-md transition-all"></div>
                      <span className="text-gray-500 font-mono text-sm tracking-widest uppercase">{member.name}</span>
                   </div>
                </div>
             )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-[#28829E] font-medium tracking-wide text-sm mb-2">{member.role}</p>
                {/* Optional Bio on hover or click could go here */}
              </div>
           </div>
        ))}
      </div>
    </div>
  )

  return (
    <main className="bg-black text-white min-h-screen relative overflow-x-hidden selection:bg-teal-500/30">
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <HeroScene />
        <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>
      </div>

       {/* Background Grid & Lines */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        {/* Vertical Glowing Lines */}
        <div className="absolute left-1/4 top-0 w-px h-0 bg-gradient-to-b from-transparent via-teal-500/50 to-transparent bg-line"></div>
        <div className="absolute left-1/2 top-0 w-px h-0 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent bg-line delay-75"></div>
        <div className="absolute left-3/4 top-0 w-px h-0 bg-gradient-to-b from-transparent via-teal-500/50 to-transparent bg-line delay-150"></div>
      </div>

      {/* Hero Section */}
      <section 
        id="home"
        ref={heroRef}
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 pt-24 pb-20 max-w-7xl mx-auto"
      >
         <div className="max-w-4xl">
           <div className="hero-text-item inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-mono mb-8 backdrop-blur-md">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
             </span>
             LIVE: TECH NEWS FEED
           </div>
           
           <h1 className="hero-text-item text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
             The Future <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500">
               Decoded.
             </span>
           </h1>
           
           <p className="hero-text-item text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed font-light">
             Digitex is a student-led publication exploring the intersection of technology, innovation, and society.
           </p>
           
           <div className="hero-text-item flex flex-wrap gap-4">
             <MagneticButton strength={0.3}>
                <Link href="/blog">
                  <Button size="lg" className="h-14 px-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-[0_0_20px_rgba(40,130,158,0.5)] border border-teal-400/20">
                    Read the Blog <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
             </MagneticButton>
             <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-white/20 hover:bg-white/5 text-white bg-white/5 backdrop-blur-md">
               About Us
             </Button>
           </div>
         </div>
      </section>

      {/* Our Foundation Section */}
      <section id="foundation" className="relative z-10 py-32 bg-black/90 border-t border-white/5 overflow-hidden backdrop-blur-sm">
        {/* Background Orbs */}
        <Orb color="bg-teal-600" className="-left-40 top-20 opacity-30" />
        <Orb color="bg-purple-600" className="-right-40 bottom-20 opacity-20" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Our <span className="text-[#28829E]">Foundation</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Who We Are */}
            <SpotlightCard className="foundation-card text-center group p-8 hover:-translate-y-2 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#28829E] group-hover:shadow-[0_0_20px_#28829E] transition-all">
                <Users className="w-10 h-10 text-[#28829E] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Who Are We</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                Digitex is the premier technology publication of our university, dedicated to demystifying complex innovations. We bridge the gap between academic theory and real-world application.
              </p>
            </SpotlightCard>

            {/* What We Do */}
            <SpotlightCard className="foundation-card text-center group p-8 hover:-translate-y-2 relative" spotlightColor="rgba(14, 165, 233, 0.25)">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0EA5E9] group-hover:shadow-[0_0_20px_#0EA5E9] transition-all">
                <Zap className="w-10 h-10 text-[#0EA5E9] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">What We Do</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                We publish bi-weekly articles, host tech-talks with industry leaders, and organize hackathons that challenge the status quo. Our platform serves as a launchpad for student ideas.
              </p>
            </SpotlightCard>

            {/* Vision */}
            <SpotlightCard className="foundation-card text-center group p-8 hover:-translate-y-2 relative" spotlightColor="rgba(168, 85, 247, 0.25)">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
               <div className="w-20 h-20 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:shadow-[0_0_20px_purple] transition-all">
                <Globe className="w-10 h-10 text-purple-500 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                To create a campus culture where technology is accessible, understood, and leveraged for social good. We envision a future where every student is empowered to build.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative z-10 py-32 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Meet the Team</h2>
          
          {teamMembers.length > 0 ? (
            <div className="space-y-16">
              {renderTeamGrid(leardership, "Leadership")}
              {renderTeamGrid(techTeam, "Technology")}
              {renderTeamGrid(medTeam, "Medicine")}
              {renderTeamGrid(commTeam, "Commerce")}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Loading Team...</div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-32 bg-black overflow-hidden">
        <Orb color="bg-[#28829E]" className="right-0 top-0 opacity-10" />
        
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-400 mb-12 text-lg">
            Have a story to pitch or want to join the team? Drop us a line.
          </p>

          <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-left shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Name</label>
                  <Input 
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="John Doe" 
                    className="bg-black/50 border-white/10 h-12 rounded-xl focus:border-[#28829E]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <Input 
                    required
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="john@example.com" 
                    className="bg-black/50 border-white/10 h-12 rounded-xl focus:border-[#28829E]" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Message</label>
                <textarea 
                  required
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#28829E] focus:ring-1 focus:ring-[#28829E] transition-all resize-none"
                  placeholder="Tell us what's on your mind..."
                ></textarea>
              </div>

              <div className="space-y-4">
                <Button 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#28829E] hover:bg-teal-700 text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(40,130,158,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"} 
                  {!isSubmitting && <MessageSquare className="ml-2 w-5 h-5" />}
                </Button>
                
                {submitStatus === "success" && (
                  <p className="text-green-400 text-center font-medium bg-green-400/10 p-4 rounded-xl border border-green-400/20">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="text-red-400 text-center font-medium bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                    Something went wrong. Please try again.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

    </main>
  )
}
