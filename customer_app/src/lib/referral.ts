const REFERRAL_STORAGE_KEY = "ordersync_ref";

/**
 * Capture a `?ref=` referral code from the current URL into localStorage so it
 * survives the (async) Google popup sign-in and any client-side navigation
 * between the landing page and the sign-in screen.
 *
 * The first captured value wins: a returning customer opening their own invite
 * link must not clobber an earlier referral that is still pending attribution.
 */
export function captureReferralParam(): void {
  try {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(REFERRAL_STORAGE_KEY)) return;

    const ref = new URLSearchParams(window.location.search)
      .get("ref")
      ?.trim();
    if (!ref) return;

    // Firebase auth UIDs are URL-safe base64-ish strings ([A-Za-z0-9_-]).
    if (!/^[A-Za-z0-9_-]{6,128}$/.test(ref)) return;

    localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
  } catch {
    // localStorage may be unavailable (private mode / disabled storage).
  }
}

export function getStoredReferral(): string {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearStoredReferral(): void {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}