"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LocationProvider } from "./LocationProvider";

export function LocationTracker({ children }: { children: ReactNode }) {
  const { userData } = useAuth();
  return (
    <LocationProvider online={userData?.online}>
      {children}
    </LocationProvider>
  );
}
