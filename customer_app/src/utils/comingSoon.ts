export const IS_COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

/**
 * Routes that stay reachable while the app is in coming-soon mode
 * (sign-in and the profile/onboarding editor).
 */
export const COMING_SOON_EXEMPT_PATHS = ["/signin", "/onboarding"];

export function isComingSoonExemptPath(pathname: string) {
  return COMING_SOON_EXEMPT_PATHS.includes(pathname);
}