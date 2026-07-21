"use client";

import { ReactNode } from "react";
import useUser from "@/hooks/useUser";
import { LocationProvider } from "./LocationProvider";

export function LocationTracker({ children }: { children: ReactNode }) {
  const { userData } = useUser();
  return (
    <LocationProvider online={userData?.online}>
      {children}
    </LocationProvider>
  );
}
