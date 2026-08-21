"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchMyOrdersQuery } from "@/rtk/api/firestoreApi";
import { haversineDistance } from "@/utilities/routeOptimizer";
import type { OrderType, LiveLocation } from "@ordersync/types";

type DriverState = "idle" | "reserved" | "pickedUp";
export type GeoPermissionState = "unsupported" | "denied" | "granted" | "prompt";
export type DriverPosition = { lat: number; lng: number; heading?: number };

type PositionFix = DriverPosition & {
  heading?: number;
  speed?: number;
  accuracy?: number;
};

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

const INTERVALS: Record<DriverState, number> = {
  idle: 25_000,
  reserved: 7_500,
  pickedUp: 4_000,
};

const BACKGROUND_INTERVAL = 20_000;
const MOVEMENT_THRESHOLD_METERS = 25;
const LOCAL_THROTTLE_MS = 2_000;
const BEARING_MIN_METERS = 5;
const BEARING_ANCHOR_TIMEOUT_MS = 8_000;

function computeBearing(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.cos(toRad(to.lng - from.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getDriverState(orders: OrderType[]): DriverState {
  for (const order of orders) {
    const status = order.status?.current;
    if (status === "PICKED_UP" || status === "ON_ROUTE") return "pickedUp";
    if (status === "RESERVED") return "reserved";
  }
  return "idle";
}

function isOnline(online: { byManager: boolean; byUser: boolean } | undefined): boolean {
  return !!online?.byManager && !!online?.byUser;
}

export function useDriverLocation(online: { byManager: boolean; byUser: boolean } | undefined) {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";

  const { data: myOrders } = useFetchMyOrdersQuery(driverUid, {
    skip: !driverUid,
  });

  const [permissionState, setPermissionState] = useState<GeoPermissionState>(() =>
    typeof navigator !== "undefined" && !navigator.geolocation ? "unsupported" : "prompt",
  );
  const [position, setPosition] = useState<DriverPosition | null>(null);

  const positionRef = useRef<PositionFix | null>(null);
  const lastBroadcastRef = useRef<LiveLocation | null>(null);
  const lastLocalUpdateRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBackgroundRef = useRef(false);
  const bearingAnchorRef = useRef<{ lat: number; lng: number; at: number } | null>(null);
  const compassHeadingRef = useRef<number | null>(null);

  const myOrdersRef = useRef(myOrders);

  useEffect(() => {
    myOrdersRef.current = myOrders;
  }, [myOrders]);

  const isOnlineNow = isOnline(online);

  const pushLocal = useCallback(() => {
    const now = Date.now();
    if (now - lastLocalUpdateRef.current < LOCAL_THROTTLE_MS) return;
    lastLocalUpdateRef.current = now;
    const fix = positionRef.current;
    if (fix) setPosition({ lat: fix.lat, lng: fix.lng, heading: fix.heading });
  }, []);

  // Channel A — local tracking for the driver's own display.
  // Permission-gated only; runs regardless of online status and never touches Firestore.
  useEffect(() => {
    if (!driverUid || !navigator.geolocation) return;

    let watchId: number;
    let permissionStatus: PermissionStatus | null = null;

    const onPosition = (pos: GeolocationPosition) => {
      const { latitude, longitude, heading, speed, accuracy } = pos.coords;

      const fix: PositionFix = { lat: latitude, lng: longitude };
      if (heading != null && !isNaN(heading)) fix.heading = heading;
      if (speed != null && !isNaN(speed)) fix.speed = speed;
      if (accuracy != null && !isNaN(accuracy)) fix.accuracy = accuracy;

      if (fix.heading == null && compassHeadingRef.current != null) {
        fix.heading = compassHeadingRef.current;
      }

      if (fix.heading == null) {
        const anchor = bearingAnchorRef.current;
        const now = Date.now();
        if (!anchor || now - anchor.at > BEARING_ANCHOR_TIMEOUT_MS) {
          bearingAnchorRef.current = { lat: fix.lat, lng: fix.lng, at: now };
        } else if (
          haversineDistance([anchor.lat, anchor.lng], [fix.lat, fix.lng]) >=
          BEARING_MIN_METERS
        ) {
          fix.heading = computeBearing(anchor, fix);
          bearingAnchorRef.current = { lat: fix.lat, lng: fix.lng, at: now };
        }
      }

      positionRef.current = fix;
      pushLocal();
    };

    const onPositionError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionState("denied");
      }
    };

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
        enableHighAccuracy: true,
        maximumAge: 2_000,
      });
    };

    const checkPermission = async () => {
      if (!navigator.permissions) {
        setPermissionState("prompt");
        startTracking();
        return;
      }

      try {
        permissionStatus = await navigator.permissions.query({ name: "geolocation" });
        setPermissionState(permissionStatus.state as GeoPermissionState);

        if (permissionStatus.state === "denied") return;

        startTracking();

        permissionStatus.addEventListener("change", () => {
          const newState = permissionStatus!.state as GeoPermissionState;
          setPermissionState(newState);

          if (newState === "granted") {
            lastLocalUpdateRef.current = 0;
            lastBroadcastRef.current = null;
            startTracking();
          }
        });
      } catch {
        setPermissionState("prompt");
        startTracking();
      }
    };

    checkPermission();

    return () => {
      if (watchId!) navigator.geolocation.clearWatch(watchId);
    };
  }, [driverUid, pushLocal]);

  // Compass — true "facing" direction, updates even while standing still.
  // iOS gates motion sensors behind a user-gesture permission; the first tap
  // anywhere requests it silently. Elsewhere the listener attaches directly.
  useEffect(() => {
    if (!driverUid || typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;

    const onOrientation = (event: Event) => {
      const e = event as OrientationEventWithCompass;
      let heading: number | null = null;
      if (
        typeof e.webkitCompassHeading === "number" &&
        !isNaN(e.webkitCompassHeading)
      ) {
        heading = e.webkitCompassHeading;
      } else if (e.absolute && e.alpha != null && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading == null) return;

      compassHeadingRef.current = heading;
      const fix = positionRef.current;
      if (fix) fix.heading = heading;
      pushLocal();
    };

    const DOE = window.DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
    const cleanups: Array<() => void> = [];

    if (typeof DOE.requestPermission === "function") {
      const requestOnFirstTap = () => {
        document.removeEventListener("pointerdown", requestOnFirstTap);
        DOE.requestPermission!()
          .then((state) => {
            if (state !== "granted") return;
            window.addEventListener("deviceorientation", onOrientation, true);
            cleanups.push(() =>
              window.removeEventListener("deviceorientation", onOrientation, true),
            );
          })
          .catch(() => {});
      };
      document.addEventListener("pointerdown", requestOnFirstTap);
      cleanups.push(() =>
        document.removeEventListener("pointerdown", requestOnFirstTap),
      );
    } else {
      window.addEventListener("deviceorientationabsolute", onOrientation, true);
      window.addEventListener("deviceorientation", onOrientation, true);
      cleanups.push(() => {
        window.removeEventListener("deviceorientationabsolute", onOrientation, true);
        window.removeEventListener("deviceorientation", onOrientation, true);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [driverUid, pushLocal]);

  // Channel B — broadcast service for consumer apps (customer tracking, fleet map).
  // Online-gated Firestore writes on their own schedule; independent of local display.
  useEffect(() => {
    if (!driverUid || !isOnlineNow) return;

    const handleVisibilityChange = () => {
      isBackgroundRef.current = document.visibilityState === "hidden";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const getInterval = () => {
      if (isBackgroundRef.current) return BACKGROUND_INTERVAL;
      return INTERVALS[getDriverState(myOrdersRef.current ?? [])];
    };

    const broadcast = async () => {
      const current = positionRef.current;
      if (!current) return;

      const last = lastBroadcastRef.current;
      if (
        last &&
        haversineDistance([last.lat, last.lng], [current.lat, current.lng]) <
          MOVEMENT_THRESHOLD_METERS
      ) {
        return;
      }

      const now = Date.now();
      const liveLocation: Record<string, number> = {
        lat: current.lat,
        lng: current.lng,
        updatedAt: now,
      };
      if (current.heading != null) liveLocation.heading = current.heading;
      if (current.speed != null) liveLocation.speed = current.speed;
      if (current.accuracy != null) liveLocation.accuracy = current.accuracy;

      try {
        await updateDoc(doc(db, "drivers", driverUid), {
          liveLocation,
          updatedAt: now,
        });
        lastBroadcastRef.current = liveLocation as unknown as LiveLocation;
      } catch (err) {
        console.error("Failed to write driver location:", err);
      }
    };

    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        await broadcast();
        schedule();
      }, getInterval());
    };

    broadcast().finally(schedule);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [driverUid, isOnlineNow]);

  return { permissionState, position };
}
