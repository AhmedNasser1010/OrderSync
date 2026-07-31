"use client";

import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, arrayUnion, arrayRemove, updateDoc } from "firebase/firestore";
import { messaging, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import useNotificationPermission from "@/hooks/useNotificationPermission";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

export default function useFcmToken() {
  const { user } = useAuth();
  const { permissionState } = useNotificationPermission();
  const currentTokenRef = useRef<string | null>(null);

  const uid = user?.uid ?? "";

  useEffect(() => {
    if (!messaging || !VAPID_KEY) return;
    if (!uid) return;
    if (permissionState !== "granted") return;

    let cancelled = false;

    const setupToken = async () => {
      try {
        const token = await getToken(messaging!, { vapidKey: VAPID_KEY! });
        if (!token || cancelled) return;

        if (token !== currentTokenRef.current) {
          currentTokenRef.current = token;
          const driverRef = doc(db, "drivers", uid);
          await updateDoc(driverRef, {
            fcmTokens: arrayUnion(token),
          });
        }
      } catch {
        // Token registration failed
      }
    };

    setupToken();

    const unsubscribe = onMessage(messaging, () => {
      // Foreground message received — token is still valid
    });

    return () => {
      cancelled = true;
      unsubscribe();

      if (currentTokenRef.current && uid) {
        const driverRef = doc(db, "drivers", uid);
        updateDoc(driverRef, {
          fcmTokens: arrayRemove(currentTokenRef.current),
        }).catch(() => {});
      }
    };
  }, [uid, permissionState]);
}
