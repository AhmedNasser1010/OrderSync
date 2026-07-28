"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDriverLocation, type GeoPermissionState, type DriverPosition } from "@/hooks/useDriverLocation";

export type { GeoPermissionState };

type LocationContextValue = {
  permissionState: GeoPermissionState;
  position: DriverPosition | null;
};

const LocationContext = createContext<LocationContextValue>({
  permissionState: "prompt",
  position: null,
});

export function LocationProvider({
  online,
  children,
}: {
  online?: { byManager: boolean; byUser: boolean };
  children: ReactNode;
}) {
  const { permissionState, position } = useDriverLocation(online);

  return (
    <LocationContext.Provider value={{ permissionState, position }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useGeoPermission() {
  return useContext(LocationContext).permissionState;
}

export function useDriverPosition() {
  return useContext(LocationContext).position;
}
