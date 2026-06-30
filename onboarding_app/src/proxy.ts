import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
 * Proxy that guards protected routes by checking for an auth-token cookie.
 *
 * If the user is not authenticated and tries to access a protected route,
 * they are redirected to the signup (register) page.
 *
 * If the user IS authenticated and tries to access auth pages,
 * they are redirected to the restaurants dashboard.
 *
 * This follows Next.js best practices for route protection:
 * - Runs at the edge before the request reaches the page
 * - No client-side flash of protected content
 * - Works even if JavaScript is disabled
 * - Server-side enforcement that can't be bypassed by client code
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth-token')?.value

  const isAuthenticated = !!authToken

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
 * This is important for performance — we only run the proxy on
 * routes that need protection or special handling.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}