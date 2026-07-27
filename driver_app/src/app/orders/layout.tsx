"use client";

import { ReactNode } from "react";
import useUser from "@/hooks/useUser";
import { useGeoPermission } from "@/components/LocationProvider";
import { OnlineToggle } from "@/components/OnlineToggle";
import { LocationPermissionBanner } from "@/components/LocationPermissionBanner";
import { BottomNav } from "@/components/orders/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapPin, MapPinOff } from "lucide-react";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  const { userData } = useUser();
  const permissionState = useGeoPermission();

  const online = userData?.online ?? { byManager: false, byUser: false };
  const isOnline = online.byManager && online.byUser;

  return (
    <ThemeProvider>
    <div className="flex flex-col min-h-screen">
      <LocationPermissionBanner />

      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Driver App</h1>
            {isOnline && permissionState === "granted" && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <MapPin className="h-3 w-3" />
                Tracking
              </span>
            )}
            {isOnline && permissionState === "prompt" && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <MapPin className="h-3 w-3" />
                Location needed
              </span>
            )}
            {!isOnline && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPinOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(permissionState === "denied" || permissionState === "unsupported") && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <MapPinOff className="h-3 w-3" />
                No Location
              </span>
            )}
            <ThemeToggle />
            <OnlineToggle byManager={online.byManager} byUser={online.byUser} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <BottomNav />
    </div>
    </ThemeProvider>
  );
}
