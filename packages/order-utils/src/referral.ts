export interface CustomerReferralShape {
  isFirstOrder?: boolean;
  referredBy?: string;
}

/**
 * A referral becomes "successful" only when the referred customer places their
 * FIRST order. `isFirstOrder` starts `true` at signup and flips to `false`
 * exactly once, so only the very first order can ever credit the referrer.
 */
export function isReferralFirstOrder(
  referral?: CustomerReferralShape | null
): boolean {
  return referral?.isFirstOrder === true;
}

export function getReferredBy(
  referral?: CustomerReferralShape | null
): string {
  const value = referral?.referredBy;
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Decide whether the referrer should be credited with this customer on their
 * first order. Self-referrals are never allowed, and the referrer document
 * must exist (partners/non-customers store no `customers/{uid}` doc and are
 * therefore not credited here).
 */
export function shouldCreditReferral(opts: {
  customerUid: string;
  referral?: CustomerReferralShape | null;
  referrerExists: boolean;
}): boolean {
  const { customerUid, referral, referrerExists } = opts;
  if (!isReferralFirstOrder(referral)) return false;
  const referredBy = getReferredBy(referral);
  if (!referredBy) return false;
  if (referredBy === customerUid) return false;
  return referrerExists;
}