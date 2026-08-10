import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useClickGuard } from "./useClickGuard";

describe("useClickGuard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes the guarded function", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useClickGuard(fn));
    await act(async () => {
      await result.current.run();
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("drops calls within the cooldown window", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useClickGuard(fn, { cooldown: 800 }));
    await act(async () => {
      await result.current.run();
      await result.current.run();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(801);
    });
    await act(async () => {
      await result.current.run();
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("drops calls that overlap an in-flight invocation", async () => {
    let resolveFn: (value: unknown) => void;
    const fn = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      })
    );
    const { result } = renderHook(() => useClickGuard(fn, { cooldown: 0 }));
    let first: Promise<void> | undefined;
    await act(async () => {
      first = result.current.run();
      await result.current.run();
      resolveFn!(undefined);
      await first;
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("allows an immediate retry after an error when resetOnError is on", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useClickGuard(fn, { cooldown: 800 }));
    await act(async () => {
      await expect(result.current.run()).rejects.toThrow("boom");
    });
    await act(async () => {
      await result.current.run();
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("keeps the cooldown after an error when resetOnError is off", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() =>
      useClickGuard(fn, { cooldown: 800, resetOnError: false })
    );
    await act(async () => {
      await expect(result.current.run()).rejects.toThrow("boom");
    });
    await act(async () => {
      await result.current.run();
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("flips the busy flag while a call is in-flight", async () => {
    let resolveFn: (value: unknown) => void;
    const fn = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      })
    );
    const { result } = renderHook(() => useClickGuard(fn, { cooldown: 0 }));
    let running: Promise<void> | undefined;
    act(() => {
      running = result.current.run();
    });
    expect(result.current.busy).toBe(true);
    await act(async () => {
      resolveFn!(undefined);
      await running;
    });
    expect(result.current.busy).toBe(false);
  });
});
