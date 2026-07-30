"use client";

import { useGeoPermission, type GeoPermissionState } from "./LocationProvider";
import { MapPinOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function LocationPermissionBanner() {
  const t = useTranslations("location");
  const permissionState = useGeoPermission();

  const config: Record<GeoPermissionState, { text: string; className: string } | null> = {
    unsupported: {
      text: t("notSupported"),
      className: "bg-yellow-50 text-yellow-800 border-yellow-200",
    },
    denied: {
      text: t("accessDenied"),
      className: "bg-red-50 text-red-800 border-red-200",
    },
    prompt: null,
    granted: null,
  };

  const state = config[permissionState];
  if (!state) return null;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-sm border-b ${state.className}`}>
      <MapPinOff className="h-4 w-4 shrink-0" />
      <span>{state.text}</span>
    </div>
  );
}
