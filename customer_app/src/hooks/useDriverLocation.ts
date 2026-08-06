"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DRIVER_STATUSES = ["RESERVED", "PICKED_UP", "ON_ROUTE"];

export function useDriverLocation(
  driverUid?: string | null,
  orderStatus?: string
) {
  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [driverPhone, setDriverPhone] = useState<string | null>(null);

  const isActive = Boolean(
    driverUid && orderStatus && DRIVER_STATUSES.includes(orderStatus)
  );

  useEffect(() => {
    if (!isActive) return;

    const driverRef = doc(db, "drivers", driverUid as string);
    const unsubscribe = onSnapshot(
      driverRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setLiveLocation(
            (data.liveLocation as { lat: number; lng: number }) || null
          );
          setDriverName(
            (data.userInfo?.name as string | undefined) || null
          );
          setDriverPhone(
            (data.userInfo?.phone as string | undefined) || null
          );
        } else {
          setLiveLocation(null);
          setDriverName(null);
          setDriverPhone(null);
        }
      },
      (error) => {
        // When the driver completes the delivery, they remove this customer from
        // trackingCustomerIds, which revokes read access to the driver document.
        // That is expected (location sharing has ended), so don't surface it as a
        // permission error — just clear the live location and driver info.
        if ((error as { code?: string } | undefined)?.code !== "permission-denied") {
          console.error("Error subscribing to driver location:", error);
        }
        setLiveLocation(null);
        setDriverName(null);
        setDriverPhone(null);
      }
    );

    return () => unsubscribe();
  }, [isActive, driverUid]);

  return {
    liveLocation: isActive ? liveLocation : null,
    driverName: isActive ? driverName : null,
    driverPhone: isActive ? driverPhone : null,
  };
}
