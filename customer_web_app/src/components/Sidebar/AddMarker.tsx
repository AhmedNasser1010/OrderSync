"use client";

import { useMapEvents } from "react-leaflet";

function AddMarker({
  addMarker,
}: {
  addMarker: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click: (e) => {
      addMarker([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

export default AddMarker;
