/**
 * Client-side auth cookie management for Next.js middleware.
 *
 * The middleware reads this cookie to determine if a user is authenticated
 * before allowing access to protected routes. This follows Next.js best
 * practices for route protection with server-side enforcement.
 */

const AUTH_COOKIE_KEY = 'auth-token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export function setAuthCookie(value: string): void {
  if (typeof document === 'undefined') return

  const isSecure = window.location.protocol === 'https:'
  document.cookie = [
    `${AUTH_COOKIE_KEY}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${COOKIE_MAX_AGE}`,
    'SameSite=Lax',
    isSecure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=')
    if (key === AUTH_COOKIE_KEY) {
      return decodeURIComponent(value)
    }
  }
  return null
}