"use client";

import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const LiveMap = dynamic(
  () =>
    import("@/components/live-map/LiveMap").then((mod) => ({
      default: mod.LiveMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-5rem)]">
        <LiveMap />
      </div>
    </MainLayout>
  );
}
