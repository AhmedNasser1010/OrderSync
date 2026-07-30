"use client";

import { useToggleOnlineStatusMutation } from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

interface OnlineToggleProps {
  byManager: boolean;
  byUser: boolean;
  permissionState: "granted" | "prompt" | "denied" | "unsupported";
}

export function OnlineToggle({
  byManager,
  byUser,
  permissionState,
}: OnlineToggleProps) {
  const t = useTranslations("onlineToggle");
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const [toggleOnline, { isLoading }] = useToggleOnlineStatusMutation();

  const isOnline = byManager && byUser;
  const canToggle = byManager;
  const isTracking = isOnline && permissionState === "granted";

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

  const handleToggle = async () => {
    if (!driverUid || !canToggle || isLoading) return;
    await toggleOnline({ uid: driverUid, byUser: !byUser });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!canToggle || isLoading}
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
