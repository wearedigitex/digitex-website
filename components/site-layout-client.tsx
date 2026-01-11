"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CustomCursor } from "@/components/custom-cursor"
import { PageTransition } from "@/components/page-transition"
import { NoiseOverlay } from "@/components/ui/noise-overlay"

export function SiteLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isStudioPage = pathname?.startsWith("/studio")

  if (isStudioPage) {
    return <>{children}</>
  }

  return (
    <div className="hide-system-cursor cursor-none [&_*]:cursor-none">
      <NoiseOverlay />
      <Navigation />
      <PageTransition>
        {children}
        <Footer />
      </PageTransition>
      <CustomCursor />
    </div>
  )
}
