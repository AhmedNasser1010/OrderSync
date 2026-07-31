"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export default function useForegroundMessage(
  onPushMessage?: (payload: { title?: string; body?: string }) => void,
) {
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title;
      const body = payload.notification?.body;
      onPushMessage?.({ title, body });
    });

    return () => unsubscribe();
  }, [onPushMessage]);
}
