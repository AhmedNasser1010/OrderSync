export type AgeUrgency = "normal" | "warning" | "critical";

const WARNING_THRESHOLD_MS = 60 * 1000;
const CRITICAL_THRESHOLD_MS = 3 * 60 * 1000;

const PREPARING_WARNING_THRESHOLD_MS = 15 * 60 * 1000;
const PREPARING_CRITICAL_THRESHOLD_MS = 20 * 60 * 1000;

export function getOrderAgeMs(baseTimestamp: number): number {
  return Date.now() - baseTimestamp;
}

export function getAgeUrgency(baseTimestamp: number): AgeUrgency {
  const age = getOrderAgeMs(baseTimestamp);
  if (age >= CRITICAL_THRESHOLD_MS) return "critical";
  if (age >= WARNING_THRESHOLD_MS) return "warning";
  return "normal";
}

export function getPreparingAgeUrgency(preparingAt: number): AgeUrgency {
  const age = getOrderAgeMs(preparingAt);
  if (age >= PREPARING_CRITICAL_THRESHOLD_MS) return "critical";
  if (age >= PREPARING_WARNING_THRESHOLD_MS) return "warning";
  return "normal";
}
