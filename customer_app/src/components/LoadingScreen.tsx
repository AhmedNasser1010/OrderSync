"use client";

import { useEffect, useState } from "react";
import { useFetchBusinessesQuery } from "@/rtk/api/firestoreApi";
import { cn } from "@/lib/utils";

export default function LoadingScreen() {
  const { isLoading: isRestaurantsLoading } = useFetchBusinessesQuery();

  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  const ready = !isRestaurantsLoading;

  useEffect(() => {
    if (!ready) return;

    const fadeTimer = setTimeout(() => setFading(true), 600);
    const unmountTimer = setTimeout(() => setHidden(true), 1200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [ready]);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ backgroundColor: "#ededed" }}
      className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-500",
        fading && "pointer-events-none opacity-0"
      )}
    >
      <video
        src="/loading.webm"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="h-auto w-[min(80vw,26rem)]"
      />
    </div>
  );
}
