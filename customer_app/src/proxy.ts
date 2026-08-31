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
  const isSignin = pathname.endsWith("/signin");

  if (isOnboarding && !sessionUser) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("from", "onboarding");
    return NextResponse.redirect(url);
  }

  if (isSignin && sessionUser) {
    return applyCoopHeader(NextResponse.redirect(new URL("/", request.url)));
  }

  return applyCoopHeader(intlResponse ?? NextResponse.next({ request }));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*|.*__/auth).*)"],
};
