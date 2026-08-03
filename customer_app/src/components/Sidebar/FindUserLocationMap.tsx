"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { cn } from "@/lib/utils";

import { markerMapIcon } from "@/components/Sidebar/mapCustomMarker";
import LocationButton from "@/components/Sidebar/LocationButton";
import AddMarker from "@/components/Sidebar/AddMarker";

const DEFAULT_LOCATION: [number, number] = [29.620106778124843, 31.255811811669496];

function CenterController({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 18, { animate: true });
  }, [center, map]);
  return null;
}

interface MarkerItem {
  latlng: [number, number];
  popup: string;
  byUser: boolean;
}

function FindUserLocationMap({
  userLocation,
  defaultLocation,
  onChange,
}: {
  userLocation: [number, number] | null;
  defaultLocation: [number, number];
  onChange: (latlng: [number, number]) => void;
}) {
  const [centerLocation, setCenterLocation] = useState<[number, number]>(
    userLocation || defaultLocation
  );
  const [markers, setMarkers] = useState<MarkerItem[]>([]);

  const addMarker = (mark: [number, number]) => {
    setMarkers((current) =>
      [...current.filter((m) => !m.byUser), { latlng: mark, popup: "Home location", byUser: true }]
    );
    const notSameLocation =
      userLocation === null ||
      (mark[0] !== userLocation[0] && mark[1] !== userLocation[1]);
    if (notSameLocation) {
      onChange(mark);
    }
  };

  useEffect(() => {
    if (userLocation) {
      setCenterLocation(userLocation);
      addMarker(userLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  return (
    <MapContainer
      center={centerLocation}
      zoom={18}
      scrollWheelZoom
      className={cn("w-full h-[400px] relative z-0")}
    >
      <CenterController center={centerLocation} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
      />
      {markers?.map((mark, idx) => (
        <Marker key={idx} position={mark.latlng} icon={markerMapIcon}>
          <Popup>{mark.popup}</Popup>
        </Marker>
      ))}
      <AddMarker addMarker={addMarker} />
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control">
          <LocationButton addMarker={addMarker} />
        </div>
      </div>
    </MapContainer>
  );
}

export default FindUserLocationMap;
