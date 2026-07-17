"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDriverLocation, GeoPermissionState } from "@/hooks/useDriverLocation";

const LocationContext = createContext<GeoPermissionState>("prompt");

export function LocationProvider({
  online,
  children,
}: {
  online?: { byManager: boolean; byUser: boolean };
  children: ReactNode;
}) {
  const { permissionState } = useDriverLocation(online);

  return (
    <LocationContext.Provider value={permissionState}>
      {children}
    </LocationContext.Provider>
  );
}

export function useGeoPermission() {
  return useContext(LocationContext);
}
