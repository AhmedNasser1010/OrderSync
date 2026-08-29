"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).L = L;
}

const SERVICE_URL = "https://router.project-osrm.org/route/v1";

interface RouteControlProps {
  driverPosition: [number, number];
  destination: [number, number];
  onError?: () => void;
}

export function RouteControl({ driverPosition, destination, onError }: RouteControlProps) {
  const map = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("@fleetbase/leaflet-routing-machine").then(({ OSRMv1 }) => {
      if (cancelled) return;

      const router = new OSRMv1({ serviceUrl: SERVICE_URL, profile: "driving" });

      const waypoints = [
        { latLng: L.latLng(driverPosition[0], driverPosition[1]) },
        { latLng: L.latLng(destination[0], destination[1]) },
      ];
      router.route(waypoints,
        (err: unknown, routes?: { coordinates: L.LatLng[] }[]) => {
          if (cancelled) return;

          if (err || !routes || routes.length === 0) {
            window.open(
              `https://www.google.com/maps/dir/?api=1&origin=${driverPosition[0]},${driverPosition[1]}&destination=${destination[0]},${destination[1]}`,
              "_blank",
            );
            onError?.();
            return;
          }

          const route = routes[0];
          const polyline = L.polyline(route.coordinates, {
            color: "#3B82F6",
            weight: 5,
            opacity: 0.8,
          }).addTo(map);

          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          polylineRef.current = polyline;
        },
      );
    });

    return () => {
      cancelled = true;
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, [map, driverPosition, destination, onError]);

  return null;
}
