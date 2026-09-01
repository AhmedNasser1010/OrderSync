import type { WalletCredit } from "@ordersync/types";

/**
 * Returns the subset of credits that are currently active and unexpired, sorted
 * by soonest expiry first. Pure filtering — used on top of a normal Firestore
 * query so that (in combination with Firestore TTL) expired credits are never
 * surfaced to checkout or to the wallet UI.
 */
export function getActiveCredits(credits: WalletCredit[]): WalletCredit[] {
  const now = Date.now();
  return credits
    .filter((c) => c.status === "ACTIVE" && (c.expiresAt ?? 0) >= now)
    .sort((a, b) => a.expiresAt - b.expiresAt);
}
