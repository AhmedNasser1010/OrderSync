import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { OrderType } from "@ordersync/types";
import { getAgeUrgency, getPreparingAgeUrgency } from "@/lib/orderAge";

function playCriticalAlertSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.12);
    osc.frequency.setValueAtTime(880, now + 0.24);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.36);

    osc.start(now);
    osc.stop(now + 0.36);

    setTimeout(() => ctx.close(), 450);
  } catch {
    // AudioContext not available
  }
}

const CRITICAL_REPEAT_MS = 30_000;
const CHECK_INTERVAL_MS = 10_000;

export default function useCriticalOrderAlerts(receivedOrders: OrderType[], preparingOrders: OrderType[]) {
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const firstAlertRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set([
      ...receivedOrders.map((o) => o.id),
      ...preparingOrders.map((o) => o.id),
    ]);

    for (const [orderId, timer] of timersRef.current) {
      if (!currentIds.has(orderId)) {
        clearInterval(timer);
        timersRef.current.delete(orderId);
        firstAlertRef.current.delete(orderId);
      }
    }

    for (const order of receivedOrders) {
      const urgency = getAgeUrgency(order.timeline.placedAt);

      if (urgency === "critical" && !timersRef.current.has(order.id)) {
        if (!firstAlertRef.current.has(order.id)) {
          firstAlertRef.current.add(order.id);
          playCriticalAlertSound();
          toast.warning(`Order #${order.orderNumber} waiting too long!`, {
            description: "This order needs your attention.",
            duration: 8000,
          });
        }

        const timer = setInterval(() => {
          playCriticalAlertSound();
          toast.warning(`Order #${order.orderNumber} still waiting!`, {
            description: "This order needs your attention.",
            duration: 8000,
          });
        }, CRITICAL_REPEAT_MS);

        timersRef.current.set(order.id, timer);
      }
    }

    for (const order of preparingOrders) {
      if (!order.timeline.preparingAt) continue;
      const urgency = getPreparingAgeUrgency(order.timeline.preparingAt);

      if (urgency === "critical" && !timersRef.current.has(order.id)) {
        if (!firstAlertRef.current.has(order.id)) {
          firstAlertRef.current.add(order.id);
          playCriticalAlertSound();
          toast.warning(`Order #${order.orderNumber} taking too long to prepare!`, {
            description: "This order needs your attention.",
            duration: 8000,
          });
        }

        const timer = setInterval(() => {
          playCriticalAlertSound();
          toast.warning(`Order #${order.orderNumber} still being prepared!`, {
            description: "This order needs your attention.",
            duration: 8000,
          });
        }, CRITICAL_REPEAT_MS);

        timersRef.current.set(order.id, timer);
      }
    }
  }, [receivedOrders, preparingOrders]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearInterval(timer);
      }
      timersRef.current.clear();
      firstAlertRef.current.clear();
    };
  }, []);
}
