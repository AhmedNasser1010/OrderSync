"use client";

import { useState, useEffect, useCallback } from "react";

export type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

function normalizeState(state: string): NotificationPermissionState {
  if (state === "prompt") return "default";
  return state as NotificationPermissionState;
}

function getInitialState(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return normalizeState(Notification.permission);
}

export default function useNotificationPermission(): {
  permissionState: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermission>;
} {
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>(getInitialState);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!("permissions" in navigator)) return;

    let cancelled = false;

    navigator.permissions
      .query({ name: "notifications" })
      .then((status) => {
        if (cancelled) return;
        setPermissionState(normalizeState(status.state));
        status.addEventListener("change", () => {
          if (!cancelled) {
            setPermissionState(normalizeState(status.state));
          }
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermissionState(normalizeState(result));
    return result;
  }, []);

  return { permissionState, requestPermission };
}
