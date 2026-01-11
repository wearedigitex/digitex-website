import { cn } from "@/lib/utils"

interface OrbProps {
  className?: string
  color?: string
  size?: string
  blur?: string
}

export function Orb({ 
  className, 
  color = "bg-teal-500", 
  size = "w-96 h-96", 
  blur = "blur-[150px]" 
}: OrbProps) {
  return (
    <div 
      className={cn(
        "absolute rounded-full opacity-20 pointer-events-none mix-blend-screen animate-pulse-slow",
        color,
        size,
        blur,
        className
      )} 
    />
  )
}
