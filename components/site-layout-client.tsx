"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { SessionProvider } from "next-auth/react"
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

  return (
    <SessionProvider>
      {isStudioPage ? (
        <>{children}</>
      ) : (
        <div>
          <NoiseOverlay />
          <Navigation />
          <PageTransition>
            {children}
            <Footer />
          </PageTransition>
          <CustomCursor />
        </div>
      )}
    </SessionProvider>
  )
}
