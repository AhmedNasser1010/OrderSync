"use client";

import useNotificationPermission from "@/hooks/useNotificationPermission";
import { BellOff, BellDot } from "lucide-react";
import { useTranslations } from "next-intl";

export function NotificationPermissionBanner() {
  const t = useTranslations("notifications");
  const { permissionState, requestPermission } = useNotificationPermission();

  if (permissionState === "granted") return null;

  const config = {
    unsupported: {
      icon: BellOff,
      text: t("notSupported"),
      className: "bg-yellow-50 text-yellow-800 border-yellow-200",
      action: null,
    },
    denied: {
      icon: BellOff,
      text: t("accessDenied"),
      className: "bg-red-50 text-red-800 border-red-200",
      action: null,
    },
    default: {
      icon: BellDot,
      text: t("enablePrompt"),
      className: "bg-blue-50 text-blue-800 border-blue-200",
      action: requestPermission,
    },
  };

  const state = config[permissionState];
  if (!state) return null;

  const Icon = state.icon;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 text-sm border-b ${state.className}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{state.text}</span>
      {state.action && (
        <button
          onClick={state.action}
          className="text-xs font-medium underline underline-offset-2 hover:no-underline"
        >
          {t("enable")}
        </button>
      )}
    </div>
  );
}
