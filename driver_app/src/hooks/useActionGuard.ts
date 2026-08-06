"use client";

import { useCallback, useRef, useState } from "react";

type LockEntry = {
  /** 0 while the action is actively in-flight; otherwise the timestamp (ms)
   *  until which the key stays locked (i.e. cooldown). */
  until: number;
  /** Cooldown in ms applied after an action finishes. */
  cooldown: number;
  /** Auto-release timer for cooldown expiry. */
  timer?: ReturnType<typeof setTimeout>;
};

/**
 * Client-side button-abuse guard.
 *
 * Provides a *synchronous* per-key lock (via useRef) so a duplicate click is
 * dropped in the same event tick, closing the render-race that `isLoading`-only
 * guards suffer from. It also supports an optional cooldown (e.g. to throttle
 * a rapid online/offline toggle).
 *
 * Note: this is an in-memory, per-component-instance guard. It reliably blocks
 * fast double-taps/repeated clicks within one mounted component and session but
 * does NOT limit a determined user opening multiple tabs/devices — that requires
 * server-side (firestore.rules) throttling, which is intentionally out of scope.
 */
export function useActionGuard() {
  const locksRef = useRef<Map<string, LockEntry>>(new Map());
  const [lockedKeys, setLockedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // Recompute the reactive locked set from the ref (keys still in-flight or in cooldown).
  const refresh = useCallback(() => {
    const now = Date.now();
    const active = new Set<string>();
    locksRef.current.forEach((entry, key) => {
      if (entry.until === 0 || entry.until > now) active.add(key);
    });
    setLockedKeys(active);
  }, []);

  const clearTimer = useCallback((entry: LockEntry) => {
    if (entry.timer) {
      clearTimeout(entry.timer);
      entry.timer = undefined;
    }
  }, []);

  /** Returns true if the key can begin (acquires the lock), false if already locked. */
  const begin = useCallback(
    (key: string, cooldownMs = 0): boolean => {
      const now = Date.now();
      const existing = locksRef.current.get(key);
      if (existing && (existing.until === 0 || existing.until > now)) {
        // Already in-flight or within cooldown — drop the duplicate.
        return false;
      }
      locksRef.current.set(key, { until: 0, cooldown: cooldownMs });
      refresh();
      return true;
    },
    [refresh],
  );

  /** Marks a key as finished. Applies the cooldown (if any) via an auto-release timer. */
  const end = useCallback(
    (key: string) => {
      const entry = locksRef.current.get(key);
      if (!entry) return;
      clearTimer(entry);
      if (entry.cooldown > 0) {
        entry.until = Date.now() + entry.cooldown;
        entry.timer = setTimeout(() => {
          locksRef.current.delete(key);
          refresh();
        }, entry.cooldown);
      } else {
        locksRef.current.delete(key);
      }
      refresh();
    },
    [clearTimer, refresh],
  );

  /** Force-releases a key immediately, ignoring any cooldown. */
  const release = useCallback(
    (key: string) => {
      const entry = locksRef.current.get(key);
      if (entry) clearTimer(entry);
      locksRef.current.delete(key);
      refresh();
    },
    [clearTimer, refresh],
  );

  /** Reactive check: is the key currently locked (in-flight or in cooldown)? */
  const isLocked = useCallback((key: string): boolean => lockedKeys.has(key), [
    lockedKeys,
  ]);

  const isAnyLocked = lockedKeys.size > 0;

  return { begin, end, release, isLocked, isAnyLocked };
}
