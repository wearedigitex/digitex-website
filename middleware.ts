import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect /studio routes (admin only)
  if (pathname.startsWith("/studio")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    const user = session.user as any
    if (user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/studio/:path*"],
}
