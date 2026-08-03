"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

import {
  restaurantMapIcon,
  personMapIcon,
  markerMapIcon,
} from "@/components/Sidebar/mapCustomMarker";
import LocationButton from "@/components/Sidebar/LocationButton";
import AddMarker from "@/components/Sidebar/AddMarker";

const CheckoutLocationMap = ({
  restaurantLocation,
  userLocation,
  onCurrentLocation,
  onCustomLocation,
}: {
  restaurantLocation: [number, number];
  userLocation: [number, number] | null;
  onCurrentLocation: (latlng: [number, number]) => void;
  onCustomLocation: (latlng: [number, number]) => void;
}) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(
    userLocation
  );
  const [customLocation, setCustomLocation] = useState<[number, number] | null>(
    null
  );

  const handleFindLocation = (latlng: [number, number]) => {
    setCurrentLocation(latlng);
    onCurrentLocation(latlng);
  };

  const handleAddCustomMarker = (latlng: [number, number]) => {
    setCustomLocation(latlng);
    onCustomLocation(latlng);
  };

  return (
    <MapContainer
      center={userLocation || restaurantLocation}
      zoom={18}
      scrollWheelZoom
      className={cn("w-full h-[500px] relative z-0")}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
      />
      <Marker position={restaurantLocation} icon={restaurantMapIcon}>
        <Popup>Restaurant Location</Popup>
      </Marker>
      {currentLocation && (
        <Marker position={currentLocation} icon={personMapIcon}>
          <Popup>Current location</Popup>
        </Marker>
      )}
      {customLocation && (
        <Marker position={customLocation} icon={markerMapIcon}>
          <Popup>Your custom Delivery Position</Popup>
        </Marker>
      )}
      <AddMarker addMarker={handleAddCustomMarker} />
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control">
          <LocationButton addMarker={handleFindLocation} />
        </div>
      </div>
    </MapContainer>
  );
};

export default CheckoutLocationMap;
