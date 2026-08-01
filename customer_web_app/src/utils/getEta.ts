import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";

/**
 * ETA tuning constants.
 *
 * PREP_TIME_MIN      — assumed restaurant preparation time (minutes) used as a
 *                      fallback when no `preparingAt`/`readyAt` timestamp exists
 *                      yet (i.e. order still in RECEIVED/ACCEPTED/PREPARING).
 * DRIVER_SPEED_KMH   — assumed average urban driving speed (km/h) used to turn
 *                      a distance into a travel time. Falls back to this when
 *                      the driver's reported `speed` is missing/unreliable.
 * DISTANCE_CORRECTION— multiplier applied to the straight-line (Haversine)
 *                      distance to approximate the real road distance, which is
 *                      always longer than the crow-flies distance.
 * MIN_ETA_MIN        — minimum ETA we ever show (avoids "0 min" flicker right
 *                      before a status transition).
 */
export const PREP_TIME_MIN = 15;
export const DRIVER_SPEED_KMH = 22;
export const DISTANCE_CORRECTION = 1.3;
export const MIN_ETA_MIN = 1;

export type EtaKind = "preparing" | "enRoute" | "arrived" | null;

export interface EtaResult {
  /** Estimated whole minutes remaining until arrival, or null when unknown. */
  minutes: number | null;
  /** Absolute arrival time in epoch ms, or null when unknown. */
  arrivalTime: number | null;
  /** Which phase the ETA belongs to (drives UI copy/styling). */
  kind: EtaKind;
}

interface ComputeEtaArgs {
  status?: string;
  timeline?: {
    placedAt?: number;
    preparingAt?: number;
    readyAt?: number;
    onRouteAt?: number;
    deliveredAt?: number;
  } | null;
  driverLocation?: { lat: number; lng: number; speed?: number } | null;
  deliveryLatlng?: [number, number] | null;
  restaurantLatlng?: [number, number] | null;
  /**
   * Optional override for the assumed prep time (minutes). When the restaurant
   * is already past the preparing stage the actual elapsed prep time is used
   * instead, so this only applies to the pre-prep estimate.
   */
  prepTimeMin?: number;
}

/**
 * Compute the estimated time to arrive (ETA) for a tracked order.
 *
 * The ETA is calculated purely on the client from the order's `timeline`
 * timestamps and the live driver location (when available). It is intentionally
 * a heuristic — a straight-line distance with a road-network correction factor
 * divided by an assumed urban driving speed. It is accurate enough for a
 * customer-facing estimate and avoids any backend or routing-API dependency.
 *
 * Phase mapping:
 *  - DELIVERED / GIVEN_FEEDBACK  → arrived (0 min)
 *  - RESERVED / PICKED_UP / ON_ROUTE → live en-route ETA from driver position
 *  - RECEIVED / ACCEPTED / PREPARING / READY → prep estimate + travel estimate
 */
export function computeEta(args: ComputeEtaArgs): EtaResult {
  const {
    status,
    timeline,
    driverLocation,
    deliveryLatlng,
    restaurantLatlng,
    prepTimeMin = PREP_TIME_MIN,
  } = args;

  // Terminal success states — order has already arrived.
  if (status === "DELIVERED" || status === "GIVEN_FEEDBACK") {
    return { minutes: 0, arrivalTime: timeline?.deliveredAt ?? null, kind: "arrived" };
  }

  // Error / non-trackable states — no ETA to show.
  if (
    !status ||
    status === "CANCELED" ||
    status === "REJECTED" ||
    status === "VOIDED"
  ) {
    return { minutes: null, arrivalTime: null, kind: null };
  }

  const now = Date.now();

  // ----- En-route phase: use the live driver position ---------------------
  if (
    (status === "RESERVED" || status === "PICKED_UP" || status === "ON_ROUTE") &&
    driverLocation &&
    deliveryLatlng
  ) {
    const distanceKm =
      getDistanceFromLatlngInKm(
        [driverLocation.lat, driverLocation.lng],
        [deliveryLatlng[0], deliveryLatlng[1]]
      ) * DISTANCE_CORRECTION;

    const speedKmh =
      typeof driverLocation.speed === "number" && driverLocation.speed > 5
        ? driverLocation.speed * 3.6 // m/s → km/h
        : DRIVER_SPEED_KMH;

    const minutes = Math.max(
      MIN_ETA_MIN,
      Math.round((distanceKm / speedKmh) * 60)
    );

    return {
      minutes,
      arrivalTime: now + minutes * 60_000,
      kind: "enRoute",
    };
  }

  // ----- Pre-driver phase: prep time + travel estimate --------------------
  if (deliveryLatlng) {
    // Remaining preparation time.
    let prepRemainingMin: number;
    if (timeline?.preparingAt) {
      // Already preparing — assume prep finishes `prepTimeMin` after it started.
      const prepEnd = timeline.preparingAt + prepTimeMin * 60_000;
      prepRemainingMin = Math.max(0, Math.ceil((prepEnd - now) / 60_000));
    } else if (timeline?.readyAt) {
      prepRemainingMin = 0;
    } else {
      prepRemainingMin = prepTimeMin;
    }

    // Travel estimate from restaurant → delivery (straight-line, corrected).
    let travelMin = 0;
    if (restaurantLatlng) {
      const distanceKm =
        getDistanceFromLatlngInKm(
          [restaurantLatlng[0], restaurantLatlng[1]],
          [deliveryLatlng[0], deliveryLatlng[1]]
        ) * DISTANCE_CORRECTION;
      travelMin = Math.round((distanceKm / DRIVER_SPEED_KMH) * 60);
    }

    const minutes = Math.max(MIN_ETA_MIN, prepRemainingMin + travelMin);
    return {
      minutes,
      arrivalTime: now + minutes * 60_000,
      kind: "preparing",
    };
  }

  // No delivery coordinates — can't estimate.
  return { minutes: null, arrivalTime: null, kind: null };
}

export default computeEta;
