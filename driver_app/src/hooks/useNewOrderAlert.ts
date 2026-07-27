"use client";

import { useEffect, useRef } from "react";

const ALERT_INTERVAL_MS = 10_000; // 10 seconds

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
  } catch {
    // AudioContext not available or blocked
  }
}

export default function useNewOrderAlert(
  marketplaceCount: number,
  shouldMonitor: boolean,
) {
  const prevCountRef = useRef(marketplaceCount);
  const initializedRef = useRef(false);

  // Alert on new order appearance
  useEffect(() => {
    if (!initializedRef.current) {
      prevCountRef.current = marketplaceCount;
      initializedRef.current = true;
      return;
    }

    if (
      shouldMonitor &&
      marketplaceCount > prevCountRef.current
    ) {
      playNotificationSound();
    }

    prevCountRef.current = marketplaceCount;
  }, [marketplaceCount, shouldMonitor]);

  // Continuous reminder while there are unclaimed orders and no active orders
  useEffect(() => {
    if (!shouldMonitor || marketplaceCount === 0) return;

    // Play immediately when conditions are first met
    playNotificationSound();

    // Then repeat periodically
    const intervalId = setInterval(() => {
      playNotificationSound();
    }, ALERT_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [shouldMonitor, marketplaceCount]);
}