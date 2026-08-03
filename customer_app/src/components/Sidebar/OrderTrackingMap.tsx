"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import {
  restaurantMapIcon,
  driverMapIcon,
  personMapIcon,
} from "@/components/Sidebar/mapCustomMarker";
import { cn } from "@/lib/utils";
import type { RestaurantDocument } from "@/types/restaurant";

interface OrderTrackingMapProps {
  center: [number, number];
  mapPoints: ([number, number] | null)[];
  isMapLive: boolean;
  restaurant: RestaurantDocument | undefined;
  deliveryLatlng: [number, number] | null;
  driverLocation: [number, number] | null;
  className?: string;
}

function FitMapToMarkers({ points }: { points: ([number, number] | null)[] }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points?.filter(
      (point): point is [number, number] =>
        Array.isArray(point) &&
        point[0] !== null &&
        point[0] !== undefined &&
        point[1] !== null &&
        point[1] !== undefined
    );

    if (!validPoints?.length) return;
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

function AutoResize() {
  const map = useMap();

  useEffect(() => {
    // Make sure Leaflet recalculates its size after mount and whenever the
    // container is resized (e.g. when the sidebar is opened/closed or the
    // surrounding flex layout changes). Without this the map can render as a
    // thin sliver if it was initialised while its container had no height.
    map.invalidateSize();
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  return null;
}

function OrderTrackingMap({
  center,
  mapPoints,
  isMapLive,
  restaurant,
  deliveryLatlng,
  driverLocation,
  className,
}: OrderTrackingMapProps) {
  const t = useTranslations();

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={isMapLive}
      className={cn("w-full h-[400px] relative z-0", className)}
    >
      <FitMapToMarkers points={mapPoints} />
      <AutoResize />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
      />
      {restaurant?.profile?.latlng && (
        <Marker
          position={restaurant.profile.latlng as [number, number]}
          icon={restaurantMapIcon}
        >
          <Popup>{restaurant?.profile?.name || t("Restaurant")}</Popup>
        </Marker>
      )}
      {deliveryLatlng && (
        <Marker position={deliveryLatlng} icon={personMapIcon}>
          <Popup>{t("You")}</Popup>
        </Marker>
      )}
      {driverLocation && (
        <Marker position={driverLocation} icon={driverMapIcon}>
          <Popup>{t("Driver")}</Popup>
        </Marker>
      )}
      {restaurant?.profile?.latlng && driverLocation && (
        <Polyline
          pathOptions={{ color: "grey" }}
          positions={[
            restaurant.profile.latlng as [number, number],
            driverLocation,
          ]}
        />
      )}
      {deliveryLatlng && driverLocation && (
        <Polyline positions={[deliveryLatlng, driverLocation]} />
      )}
    </MapContainer>
  );
}

export default OrderTrackingMap;
