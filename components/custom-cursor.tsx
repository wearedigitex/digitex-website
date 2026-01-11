"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null) // Moves the cursor
  const dotRef = useRef<HTMLDivElement>(null)    // Handles the look (scale, color)
  
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    
    if (!cursor || !dot) return

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      
      // Ensure cursor is visible when moving
      if (cursor.style.opacity === "0") {
        cursor.style.opacity = "1"
      }
    }

    // Smooth cursor animation with RAF
    const animate = () => {
      // Instant follow for snappiness
      cursorPos.current.x = mousePos.current.x
      cursorPos.current.y = mousePos.current.y

      cursor.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`
      requestAnimationFrame(animate)
    }

    // Event Delegation for Interactive Elements
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [role='button'], input, textarea, .cursor-pointer")) {
        dot.classList.add('scale-[2.5]', 'opacity-50')
      }
    }

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [role='button'], input, textarea, .cursor-pointer")) {
        dot.classList.remove('scale-[2.5]', 'opacity-50')
      }
    }

    // Handle visibility
    const handleMouseLeaveWindow = () => {
      cursor.style.opacity = "0"
    }

    const handleMouseEnterWindow = () => {
      cursor.style.opacity = "1"
    }

    // Attach listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseover", handleOver)
    document.addEventListener("mouseout", handleOut)
    document.addEventListener("mouseleave", handleMouseLeaveWindow)
    document.addEventListener("mouseenter", handleMouseEnterWindow)

    // Start animation loop
    const rafId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleOver)
      document.removeEventListener("mouseout", handleOut)
      document.removeEventListener("mouseleave", handleMouseLeaveWindow)
      document.removeEventListener("mouseenter", handleMouseEnterWindow)
    }
  }, [])

  return (
    <div 
      ref={cursorRef} 
      className="hidden md:block pointer-events-none fixed left-0 top-0 z-[11000] will-change-transform transition-opacity duration-300" 
      style={{ top: 0, left: 0, opacity: 0 }} 
    >
      <div 
        ref={dotRef}
        className="h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-300 ease-out will-change-transform" 
      />
    </div>
  )
}
