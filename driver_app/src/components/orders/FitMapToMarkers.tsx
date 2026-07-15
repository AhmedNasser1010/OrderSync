"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";

export function FitMapToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(
      (p) =>
        Array.isArray(p) &&
        p[0] !== null &&
        p[0] !== undefined &&
        p[1] !== null &&
        p[1] !== undefined,
    );

    if (!validPoints.length) return;

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 15, { animate: true });
      return;
    }

    map.fitBounds(latLngBounds(validPoints), {
      padding: [40, 40],
      maxZoom: 15,
      animate: true,
    });
  }, [map, points]);

  return null;
}
