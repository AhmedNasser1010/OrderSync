"use client";

import { useMap } from "react-leaflet";
import { useTranslations } from "next-intl";
import { LocateFixedIcon } from "lucide-react";
import MapButton from "@/components/Sidebar/MapButton";

function LocationButton({
  addMarker,
}: {
  addMarker: (latlng: [number, number]) => void;
}) {
  const t = useTranslations();
  const map = useMap();

  const successCallback = (position: GeolocationPosition) => {
    const latlng: [number, number] = [
      position.coords.latitude,
      position.coords.longitude,
    ];
    if (latlng) {
      map.flyTo(latlng, 15);
      addMarker(latlng);
    } else {
      console.warn(t("locationNotAvailable"));
    }
  };

  const errorCallback = (error: GeolocationPositionError) => {
    console.error("Error getting location:", error);
  };

  const options = {
    enableHighAccuracy: true,
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    } else {
      console.warn(t("geolocationUnsupported"));
    }
  };

  return (
    <MapButton
      onClick={findMyLocation}
      label={t("Find My Location")}
      startIcon={<LocateFixedIcon className="size-4" />}
    />
  );
}

export default LocationButton;
