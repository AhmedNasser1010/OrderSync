import { useState, useEffect, useRef } from "react";
import { getAgeUrgency, getPreparingAgeUrgency, type AgeUrgency } from "@/lib/orderAge";

function playUrgencySound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(880, now + 0.12);
    osc.frequency.setValueAtTime(660, now + 0.24);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);

    setTimeout(() => ctx.close(), 400);
  } catch {
    // AudioContext not available
  }
}

const TICK_INTERVAL_MS = 10_000;

export default function useOrderUrgency(placedAt: number, preparingAt?: number): AgeUrgency {
  const getUrgency = () => preparingAt ? getPreparingAgeUrgency(preparingAt) : getAgeUrgency(placedAt);

  const [urgency, setUrgency] = useState<AgeUrgency>(() => getUrgency());
  const prevUrgencyRef = useRef<AgeUrgency>(urgency);

  useEffect(() => {
    const interval = setInterval(() => {
      setUrgency(getUrgency());
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [placedAt, preparingAt]);

  useEffect(() => {
    if (urgency !== prevUrgencyRef.current) {
      if (urgency === "warning" || urgency === "critical") {
        playUrgencySound();
      }
      prevUrgencyRef.current = urgency;
    }
  }, [urgency]);

  return urgency;
}
