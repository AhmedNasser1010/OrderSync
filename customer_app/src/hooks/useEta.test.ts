import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useEta from "./useEta";

describe("useEta", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes convenience booleans for the preparing phase", () => {
    const { result } = renderHook(() =>
      useEta({
        status: "PREPARING",
        restaurantLatlng: [30, 31],
        deliveryLatlng: [30.02, 31],
      })
    );
    expect(result.current.kind).toBe("preparing");
    expect(result.current.isPreparing).toBe(true);
    expect(result.current.isEnRoute).toBe(false);
    expect(result.current.isArrived).toBe(false);
  });

  it("exposes convenience booleans for the en-route phase", () => {
    const { result } = renderHook(() =>
      useEta({
        status: "ON_ROUTE",
        driverLocation: { lat: 30, lng: 31, speed: 11 },
        deliveryLatlng: [30.01, 31],
      })
    );
    expect(result.current.isEnRoute).toBe(true);
    expect(result.current.isPreparing).toBe(false);
  });

  it("marks an order as arrived when delivered", () => {
    const { result } = renderHook(() =>
      useEta({ status: "DELIVERED", timeline: { deliveredAt: NOW } })
    );
    expect(result.current.isArrived).toBe(true);
    expect(result.current.minutes).toBe(0);
  });

  it("recomputes when the status changes", () => {
    const { result, rerender } = renderHook(
      (props: { status?: string }) =>
        useEta({
          status: props.status,
          restaurantLatlng: [30, 31],
          deliveryLatlng: [30.02, 31],
        }),
      { initialProps: { status: "RECEIVED" } }
    );
    expect(result.current.kind).toBe("preparing");

    rerender({ status: "CANCELED" });
    expect(result.current.kind).toBeNull();
    expect(result.current.minutes).toBeNull();
  });

  it("recomputes when the driver location moves", () => {
    const { result, rerender } = renderHook(
      (props: { driverLocation?: { lat: number; lng: number; speed?: number } | null }) =>
        useEta({
          status: "ON_ROUTE",
          driverLocation: props.driverLocation,
          deliveryLatlng: [30.01, 31],
        }),
      { initialProps: { driverLocation: null } }
    );
    // ON_ROUTE without a driver position falls back to the prep estimate.
    expect(result.current.kind).toBe("preparing");

    rerender({ driverLocation: { lat: 30, lng: 31, speed: 11 } });
    expect(result.current.kind).toBe("enRoute");
    expect(result.current.minutes).toBe(2);
  });

  it("keeps the same result values when inputs are unchanged", () => {
    const props = {
      status: "DELIVERED",
      timeline: { deliveredAt: NOW },
    };
    const { result, rerender } = renderHook(() => useEta(props));
    const first = result.current;
    rerender();
    expect(result.current).toStrictEqual(first);
  });
});
