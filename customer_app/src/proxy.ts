import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const intlMiddleware = createMiddleware(routing);

function applyCoopHeader(response: Response) {
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = session ? await verifySessionCookie(session) : null;

  const isOnboarding = pathname.endsWith("/onboarding");

  if (isOnboarding && !sessionUser) {
    // Preserve the locale prefix (e.g. /en/onboarding -> /en/signin) so the
    // redirect does not fall back to the default locale.
    const signinPath = pathname.replace(/\/onboarding\/?$/, "/signin");
    const url = new URL(signinPath, request.url);
    url.searchParams.set("from", "onboarding");
    return NextResponse.redirect(url);
  }

  // Note: /signin is intentionally NOT guarded here. Authenticated users are
  // redirected client-side by SignInView (router.replace("/")). A middleware
  // bounce based on the session cookie silently cancels client-initiated
  // navigation (e.g. the drawer login button) whenever the cookie and the
  // client-side Firebase auth state disagree.

  return applyCoopHeader(intlResponse ?? NextResponse.next({ request }));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*|.*__/auth).*)"],
};
