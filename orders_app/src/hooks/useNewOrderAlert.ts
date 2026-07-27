import { useEffect, useRef } from "react";
import { useAppSelector } from "@/rtk/hooks";
import { activeTab } from "@/rtk/slices/toggleSlice";

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

export default function useNewOrderAlert(receivedCount: number) {
  const activeTabValue = useAppSelector(activeTab);
  const prevCountRef = useRef(receivedCount);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      prevCountRef.current = receivedCount;
      initializedRef.current = true;
      return;
    }

    if (receivedCount > prevCountRef.current && activeTabValue === "RECEIVED") {
      playNotificationSound();
    }

    prevCountRef.current = receivedCount;
  }, [receivedCount, activeTabValue]);
}
