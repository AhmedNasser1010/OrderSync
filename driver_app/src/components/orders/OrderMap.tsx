"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FitMapToMarkers } from "./FitMapToMarkers";
import { driverIcon, orderIcon, restaurantIcon } from "./mapCustomMarker";
import type { LiveLocation } from "@ordersync/types";
import "leaflet/dist/leaflet.css";

interface OrderMapProps {
  orderLocation: [number, number];
  driverLocation?: LiveLocation | null;
  restaurantLocation?: [number, number];
}

export function OrderMap({ orderLocation, driverLocation, restaurantLocation }: OrderMapProps) {
  const driverLatLng: [number, number] | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  const points: [number, number][] = [orderLocation];
  if (driverLatLng) points.push(driverLatLng);
  if (restaurantLocation) points.push(restaurantLocation);

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
        {driverLatLng && (
          <Marker position={driverLatLng} icon={driverIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        {restaurantLocation && (
          <Marker position={restaurantLocation} icon={restaurantIcon}>
            <Popup>Restaurant</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
