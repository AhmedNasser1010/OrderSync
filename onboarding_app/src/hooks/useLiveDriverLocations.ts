"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface LiveLocation {
  lat: number;
  lng: number;
  updatedAt: number;
}

export function useLiveDriverLocations(partnerUid: string) {
  const [locations, setLocations] = useState<Map<string, LiveLocation>>(
    () => new Map()
  );
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!partnerUid) return;

    const ref = collection(db, "drivers");
    const q = query(ref, where("partnerUid", "==", partnerUid));

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const next = new Map<string, LiveLocation>();
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const loc = data.liveLocation;
          if (
            loc &&
            typeof loc.lat === "number" &&
            typeof loc.lng === "number" &&
            loc.lat !== 0 &&
            loc.lng !== 0
          ) {
            next.set(docSnap.id, {
              lat: loc.lat,
              lng: loc.lng,
              updatedAt: loc.updatedAt ?? 0,
            });
          }
        });
        setLocations(next);
      },
      (error) => {
        console.error("Error in live driver locations listener:", error?.message);
      }
    );

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [partnerUid]);

  return locations;
}
