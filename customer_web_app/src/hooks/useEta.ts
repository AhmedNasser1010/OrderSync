"use client";

import { useMemo } from "react";
import { computeEta, type EtaResult } from "@/utils/getEta";

interface UseEtaArgs {
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
  prepTimeMin?: number;
}

/**
 * React hook that derives the order ETA from the tracked order data and the
 * live driver location. Recomputes whenever any of its inputs change (e.g. a
 * new driver location snapshot or a status transition).
 *
 * Returns the raw `EtaResult` plus convenience booleans used by the UI.
 */
export function useEta(args: UseEtaArgs): EtaResult & {
  isPreparing: boolean;
  isEnRoute: boolean;
  isArrived: boolean;
} {
  const eta = useMemo(
    () =>
      computeEta({
        status: args.status,
        timeline: args.timeline,
        driverLocation: args.driverLocation,
        deliveryLatlng: args.deliveryLatlng,
        restaurantLatlng: args.restaurantLatlng,
        prepTimeMin: args.prepTimeMin,
      }),
    [
      args.status,
      args.timeline,
      args.driverLocation,
      args.deliveryLatlng,
      args.restaurantLatlng,
      args.prepTimeMin,
    ]
  );

  return {
    ...eta,
    isPreparing: eta.kind === "preparing",
    isEnRoute: eta.kind === "enRoute",
    isArrived: eta.kind === "arrived",
  };
}

export default useEta;
