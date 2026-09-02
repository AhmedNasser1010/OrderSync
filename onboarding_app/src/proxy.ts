import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Public routes that unauthenticated users can access.
 * These include authentication pages and any other public pages.
 */
const publicRoutes = ['/auth/signin', '/auth/signup']

/**
 * The root path is also public (it redirects to /restaurants).
 */
const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some((route) => pathname.startsWith(route)) || pathname === '/'
}

/**
 * Proxy that guards protected routes by verifying the httpOnly session cookie.
 *
 * The session cookie is set server-side (httpOnly, not readable by JS) and is
 * cryptographically verified against Firebase here at the edge, so route
 * protection cannot be bypassed by a forged client cookie.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const sessionUser = session ? await verifySessionCookie(session) : null

  const isAuthenticated = !!sessionUser

  // Allow public routes when not authenticated
  if (!isAuthenticated && isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to signup (register)
  if (!isAuthenticated) {
    const signupUrl = new URL('/auth/signup', request.url)
    signupUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signupUrl)
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && isPublicRoute(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/restaurants', request.url))
  }

  return NextResponse.next()
}

/**
 * Configure which routes the proxy should run on.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
