"use client";

import { useGeoPermission, type GeoPermissionState } from "./LocationProvider";
import { MapPinOff } from "lucide-react";

const MESSAGES: Record<GeoPermissionState, { text: string; className: string } | null> = {
  unsupported: {
    text: "Geolocation is not supported by your browser",
    className: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  denied: {
    text: "Location access denied. Enable it in your browser settings to go online.",
    className: "bg-red-50 text-red-800 border-red-200",
  },
  prompt: null,
  granted: null,
};

export function LocationPermissionBanner() {
  const permissionState = useGeoPermission();
  const config = MESSAGES[permissionState];
  if (!config) return null;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-sm border-b ${config.className}`}>
      <MapPinOff className="h-4 w-4 shrink-0" />
      <span>{config.text}</span>
    </div>
  );
}
