"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import { useFetchMyOrdersQuery } from "@/rtk/api/firestoreApi";
import type { OrderType, LiveLocation } from "@ordersync/types";

type DriverState = "idle" | "reserved" | "pickedUp";
export type GeoPermissionState = "unsupported" | "denied" | "granted" | "prompt";

const INTERVALS: Record<DriverState, number> = {
  idle: 25_000,
  reserved: 7_500,
  pickedUp: 4_000,
};

const BACKGROUND_INTERVAL = 20_000;
const MOVEMENT_THRESHOLD_METERS = 25;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";

  const { data: myOrders } = useFetchMyOrdersQuery(driverUid, {
    skip: !driverUid,
  });

  const [permissionState, setPermissionState] = useState<GeoPermissionState>("prompt");

  const lastLocationRef = useRef<LiveLocation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBackgroundRef = useRef(false);

  const writeLocation = useCallback(
    async (position: GeolocationPosition) => {
      if (!driverUid) return;
      if (!isOnline(online)) return;

      const { latitude, longitude, heading, speed, accuracy } = position.coords;
      const now = Date.now();

      const last = lastLocationRef.current;
      if (last) {
        const dist = haversineDistance(last.lat, last.lng, latitude, longitude);
        if (dist < MOVEMENT_THRESHOLD_METERS) return;
      }

      const liveLocation: Record<string, number> = {
        lat: latitude,
        lng: longitude,
        updatedAt: now,
      };
      if (heading != null && !isNaN(heading)) liveLocation.heading = heading;
      if (speed != null && !isNaN(speed)) liveLocation.speed = speed;
      if (accuracy != null && !isNaN(accuracy)) liveLocation.accuracy = accuracy;

      try {
        await updateDoc(doc(db, "drivers", driverUid), {
          liveLocation,
          updatedAt: now,
        });
        lastLocationRef.current = liveLocation as unknown as LiveLocation;
      } catch (err) {
        console.error("Failed to write driver location:", err);
      }
    },
    [driverUid, online],
  );

  useEffect(() => {
    if (!driverUid || !navigator.geolocation) {
      if (!navigator.geolocation) setPermissionState("unsupported");
      return;
    }
    if (!isOnline(online)) return;

    let watchId: number;
    let lastWriteTime = 0;
    let permissionStatus: PermissionStatus | null = null;

    const handleVisibilityChange = () => {
      isBackgroundRef.current = document.visibilityState === "hidden";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startTracking = () => {
      const driverState = getDriverState(myOrders ?? []);

      const getInterval = () => {
        if (isBackgroundRef.current) return BACKGROUND_INTERVAL;
        return INTERVALS[driverState];
      };

      const onPosition = (position: GeolocationPosition) => {
        const now = Date.now();
        const interval = getInterval();
        if (now - lastWriteTime < interval) return;

        lastWriteTime = now;
        writeLocation(position).then(() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          const remaining = getInterval();
          timerRef.current = setTimeout(() => {
            navigator.geolocation.getCurrentPosition(onPosition, () => {}, {
              enableHighAccuracy: true,
            });
          }, remaining);
        });
      };

      const onPositionError = (error: GeolocationPositionError) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
        }
      };

      watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
        enableHighAccuracy: true,
        maximumAge: 5_000,
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
            lastLocationRef.current = null;
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
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [driverUid, online, myOrders, writeLocation]);

  return { permissionState };
}
