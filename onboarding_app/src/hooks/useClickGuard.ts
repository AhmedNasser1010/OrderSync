"use client";

import { useCallback, useRef, useState } from "react";

/**
 * useClickGuard
 *
 * Prevents button abuse by ignoring re-invocations of a handler while a
 * previous call is still in-flight, and by enforcing a minimum cooldown
 * between invocations.
 *
 * Options:
 * - `cooldown`: minimum milliseconds that must pass between two accepted
 *   invocations. Set to 0 to only guard against in-flight overlap.
 * - `resetOnError`: when a guarded handler throws / returns a rejected
 *   promise, the `busy` flag and the in-flight lock are cleared so the user
 *   is not stuck forever. Defaults to `true`.
 *
 * Returns:
 * - `run`: a wrapped handler. When reused as a click handler it receives the
 *   original event; it accepts any args and passes them through to `fn`.
 * - `busy`: boolean indicating an invocation is currently in-flight (or in
 *   cooldown). Useful to disable the button visually.
 */
export function useClickGuard<Args extends unknown[], R = unknown>(
  fn: (...args: Args) => R,
  { cooldown = 800, resetOnError = true }: { cooldown?: number; resetOnError?: boolean } = {}
) {
  const [busy, setBusy] = useState(false);
  // useRef values survive re-renders, so duplicate clicks are dropped even
  // before React commits the state change that disables the button.
  const inFlightRef = useRef(false);
  const lastRunRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    async (...args: Args) => {
      const now = Date.now();
      const elapsed = now - lastRunRef.current;

      // Drop the call if we are still busy OR we are inside the cooldown
      // window since the last accepted invocation.
      if (inFlightRef.current || elapsed < cooldown) {
        return;
      }

      inFlightRef.current = true;
      lastRunRef.current = now;
      setBusy(true);

      try {
        await fn(...args);
      } catch (error) {
        if (resetOnError) {
          // let callers retry after an error
          lastRunRef.current = 0;
        }
        throw error;
      } finally {
        inFlightRef.current = false;
        setBusy(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    },
    [fn, cooldown, resetOnError]
  );

  return { run, busy };
}
