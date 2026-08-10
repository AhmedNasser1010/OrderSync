"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchMyOrdersQuery } from "@/rtk/api/firestoreApi";
import { haversineDistance } from "@/utilities/routeOptimizer";
import type { OrderType, LiveLocation } from "@ordersync/types";

type DriverState = "idle" | "reserved" | "pickedUp";
export type GeoPermissionState = "unsupported" | "denied" | "granted" | "prompt";
export type DriverPosition = { lat: number; lng: number };

const INTERVALS: Record<DriverState, number> = {
  idle: 25_000,
  reserved: 7_500,
  pickedUp: 4_000,
};

const BACKGROUND_INTERVAL = 20_000;
const MOVEMENT_THRESHOLD_METERS = 25;

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

  const [permissionState, setPermissionState] = useState<GeoPermissionState>("prompt");
  const [position, setPosition] = useState<DriverPosition | null>(null);

  const lastLocationRef = useRef<LiveLocation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBackgroundRef = useRef(false);

  const onlineRef = useRef(online);
  const myOrdersRef = useRef(myOrders);

  useEffect(() => {
    onlineRef.current = online;
    myOrdersRef.current = myOrders;
  }, [online, myOrders]);

  const isOnlineNow = isOnline(online);

  const writeLocation = useCallback(
    async (position: GeolocationPosition) => {
      if (!driverUid) return;
      if (!isOnline(onlineRef.current)) return;

      const { latitude, longitude, heading, speed, accuracy } = position.coords;
      const now = Date.now();

      const last = lastLocationRef.current;
      if (last) {
        const dist = haversineDistance([last.lat, last.lng], [latitude, longitude]);
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
        setPosition({ lat: latitude, lng: longitude });
      } catch (err) {
        console.error("Failed to write driver location:", err);
      }
    },
    [driverUid],
  );

  useEffect(() => {
    if (!driverUid || !navigator.geolocation) {
      if (!navigator.geolocation) setPermissionState("unsupported");
      return;
    }
    if (!isOnlineNow) return;

    let watchId: number;
    let lastWriteTime = 0;
    let permissionStatus: PermissionStatus | null = null;

    const handleVisibilityChange = () => {
      isBackgroundRef.current = document.visibilityState === "hidden";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startTracking = () => {
      const getInterval = () => {
        if (isBackgroundRef.current) return BACKGROUND_INTERVAL;
        return INTERVALS[getDriverState(myOrdersRef.current ?? [])];
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
  }, [driverUid, isOnlineNow, writeLocation]);

  return { permissionState, position };
}
