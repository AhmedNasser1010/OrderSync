"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Marker } from "react-leaflet";
import type { DivIcon, Marker as LeafletMarker } from "leaflet";

const ANIMATION_MS = 2_000;
const SNAP_DISTANCE_METERS = 200;

function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function SmoothDriverMarker({
  position,
  icon,
  children,
}: {
  position: [number, number];
  icon: DivIcon;
  children?: ReactNode;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const [initialPosition] = useState(position);

  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const current = marker.getLatLng();
    const from: [number, number] = [current.lat, current.lng];
    if (from[0] === position[0] && from[1] === position[1]) return;

    if (haversineMeters(from, position) > SNAP_DISTANCE_METERS) {
      marker.setLatLng(position);
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / ANIMATION_MS, 1);
      marker.setLatLng([
        from[0] + (position[0] - from[0]) * t,
        from[1] + (position[1] - from[1]) * t,
      ]);
      frameRef.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    frameRef.current = requestAnimationFrame(step);
  }, [position]);

  return (
    <Marker ref={markerRef} position={initialPosition} icon={icon}>
      {children}
    </Marker>
  );
}
