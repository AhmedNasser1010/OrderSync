"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMemo } from "react";
import { FitMapToMarkers } from "./FitMapToMarkers";
import {
  driverIcon,
  createDriverHeadingIcon,
  orderIcon,
  restaurantIcon,
} from "./mapCustomMarker";
import { SmoothDriverMarker } from "./SmoothDriverMarker";
import "leaflet/dist/leaflet.css";

interface OrderMapProps {
  orderLocation: [number, number];
  driverLocation?: { lat: number; lng: number; heading?: number } | null;
  restaurantLocation?: [number, number];
}

export function OrderMap({ orderLocation, driverLocation, restaurantLocation }: OrderMapProps) {
  const driverLatLng: [number, number] | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  const roundedHeading =
    driverLocation?.heading != null
      ? Math.round(driverLocation.heading / 5) * 5
      : null;
  const driverMarkerIcon = useMemo(
    () => (roundedHeading != null ? createDriverHeadingIcon(roundedHeading) : driverIcon),
    [roundedHeading],
  );

  const points: [number, number][] = [orderLocation];
  if (driverLatLng) points.push(driverLatLng);
  if (restaurantLocation) points.push(restaurantLocation);

  return (
    <div className="h-[400px] -mx-4">
      <MapContainer
        center={orderLocation}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
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
          <SmoothDriverMarker position={driverLatLng} icon={driverMarkerIcon}>
            <Popup>Your Location</Popup>
          </SmoothDriverMarker>
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
