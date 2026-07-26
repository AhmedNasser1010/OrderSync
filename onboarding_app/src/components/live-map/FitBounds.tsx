"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";

interface FitBoundsProps {
  points: [number, number][];
}

export function FitBounds({ points }: FitBoundsProps) {
  const map = useMap();
  const prevCountRef = useRef(0);

  useEffect(() => {
    const validPoints = points.filter(
      (p) =>
        Array.isArray(p) &&
        p[0] != null &&
        p[1] != null &&
        !(p[0] === 0 && p[1] === 0)
    );

    if (!validPoints.length) return;

    if (validPoints.length === prevCountRef.current) return;
    prevCountRef.current = validPoints.length;

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 15, { animate: true });
      return;
    }

    map.fitBounds(latLngBounds(validPoints), {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  }, [map, points]);

  return null;
}
