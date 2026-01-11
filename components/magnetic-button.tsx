"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function MagneticButton({ children, className = "", strength = 0.4 }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const rectRef = { current: button.getBoundingClientRect() }
    
    const updateRect = () => {
      rectRef.current = button.getBoundingClientRect()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = rectRef.current
      const buttonCenterX = rect.left + rect.width / 2
      const buttonCenterY = rect.top + rect.height / 2
      
      const distanceX = e.clientX - buttonCenterX
      const distanceY = e.clientY - buttonCenterY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
      
      const magneticRadius = 150
      
      if (distance < magneticRadius) {
        const pullStrength = (1 - distance / magneticRadius) * strength
        const x = distanceX * pullStrength
        const y = distanceY * pullStrength

        gsap.to(button, {
          x,
          y,
          duration: 0.2,
          ease: "power2.out",
        })
      } else {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.3)",
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      })
    }

    button.addEventListener("mouseenter", updateRect)
    window.addEventListener("resize", updateRect)
    document.addEventListener("mousemove", handleMouseMove, { passive: true })
    button.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      button.removeEventListener("mouseenter", updateRect)
      window.removeEventListener("resize", updateRect)
      document.removeEventListener("mousemove", handleMouseMove)
      button.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [strength])

  return (
    <div ref={buttonRef} className={`${className} will-change-transform`} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
