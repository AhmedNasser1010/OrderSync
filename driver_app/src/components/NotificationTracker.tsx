"use client";

import { ReactNode } from "react";
import useFcmToken from "@/hooks/useFcmToken";
import useForegroundMessage from "@/hooks/useForegroundMessage";

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1047, now + 0.08);
    osc.frequency.setValueAtTime(880, now + 0.16);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

function ServiceWorkerRegistrator() {
  return null;
}

export function NotificationTracker({ children }: { children: ReactNode }) {
  useFcmToken();
  useForegroundMessage(() => {
    playNotificationSound();
  });

  return (
    <>
      <ServiceWorkerRegistrator />
      {children}
    </>
  );
}
