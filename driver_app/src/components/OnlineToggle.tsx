"use client";

import { useToggleOnlineStatusMutation } from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { useClickGuard } from "@/hooks/useClickGuard";
import { useTranslations } from "next-intl";

interface OnlineToggleProps {
  byManager: boolean;
  byUser: boolean;
  permissionState: "granted" | "prompt" | "denied" | "unsupported";
}

/** Short cooldown so rapid online/offline tapping doesn't spam Firestore writes. */
const TOGGLE_COOLDOWN_MS = 500;

export function OnlineToggle({
  byManager,
  byUser,
  permissionState,
}: OnlineToggleProps) {
  const t = useTranslations("onlineToggle");
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const [toggleOnline, { isLoading }] = useToggleOnlineStatusMutation();

  const { run: runToggle, busy } = useClickGuard(
    async () => {
      if (!driverUid || !byManager) return;
      await toggleOnline({ uid: driverUid, byUser: !byUser });
    },
    { cooldown: TOGGLE_COOLDOWN_MS, resetOnError: true },
  );

  const isOnline = byManager && byUser;
  const canToggle = byManager;
  const isTracking = isOnline && permissionState === "granted";
  const isToggling = isLoading || busy;

  const label = (() => {
    if (isTracking) return t("online");
    if (isOnline && permissionState === "prompt") return t("locationNeeded");
    if (permissionState === "denied" || permissionState === "unsupported") {
      return t("noLocationAccess");
    }
    return t("offline");
  })();

  const dotClassName = (() => {
    if (isTracking) return "bg-emerald-500";
    if (isOnline && permissionState === "prompt") return "bg-amber-500";
    if (permissionState === "denied" || permissionState === "unsupported") {
      return "bg-rose-500";
    }
    return "bg-muted-foreground/50";
  })();

  return (
    <button
      onClick={() => void runToggle()}
      disabled={!canToggle || isToggling}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
        isTracking
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-background text-muted-foreground"
      } ${!canToggle ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
      {label}
    </button>
  );
}
