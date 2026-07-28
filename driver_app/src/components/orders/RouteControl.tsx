"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).L = L;
}

const SERVICE_URL = "https://routing.fleetbase.io";

interface RouteControlProps {
  driverPosition: [number, number];
  destination: [number, number];
}

export function RouteControl({ driverPosition, destination }: RouteControlProps) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("@fleetbase/leaflet-routing-machine").then(({ OSRMv1, Control: RoutingControl }) => {
      if (cancelled) return;

      const router = new OSRMv1({ serviceUrl: SERVICE_URL, profile: "driving" });
      const control = new RoutingControl({
        waypoints: [L.latLng(driverPosition[0], driverPosition[1]), L.latLng(destination[0], destination[1])],
        router,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: "#3B82F6", weight: 5, opacity: 0.8 }] },
        createMarker: () => null,
      }).addTo(map);

      controlRef.current = control;
    });

    return () => {
      cancelled = true;
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, driverPosition, destination]);

  return null;
}
