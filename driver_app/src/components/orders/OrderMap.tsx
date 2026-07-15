"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FitMapToMarkers } from "./FitMapToMarkers";
import { driverIcon, orderIcon } from "./mapCustomMarker";
import "leaflet/dist/leaflet.css";

interface OrderMapProps {
  orderLocation: [number, number];
  driverLocation?: [number, number];
}

export function OrderMap({ orderLocation, driverLocation }: OrderMapProps) {
  const points: [number, number][] = [orderLocation];
  if (driverLocation) points.push(driverLocation);

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={orderLocation}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitMapToMarkers points={points} />
        <Marker position={orderLocation} icon={orderIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>
        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
