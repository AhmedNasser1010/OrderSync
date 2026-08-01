"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DRIVER_STATUSES = ["RESERVED", "PICKED_UP", "ON_ROUTE"];

export function useDriverLocation(
  driverUid?: string | null,
  orderStatus?: string
) {  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!driverUid || !orderStatus || !DRIVER_STATUSES.includes(orderStatus)) {
      setLiveLocation(null);
      return;
    }

    const driverRef = doc(db, "drivers", driverUid);
    const unsubscribe = onSnapshot(
      driverRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setLiveLocation((data.liveLocation as { lat: number; lng: number }) || null);
        } else {
          setLiveLocation(null);
        }
      },
      (error) => {
        console.error("Error subscribing to driver location:", error);
        setLiveLocation(null);
      }
    );

    return () => unsubscribe();
  }, [driverUid, orderStatus]);

  return liveLocation;
}
