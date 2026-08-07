"use client";

import DeliveryLocation from "@/components/DeliveryLocation";
import RestaurantSearch from "@/components/RestaurantSearch";

function LocationBar() {
  return (
    <div className="flex items-center gap-3 pt-4 w-full">
      <DeliveryLocation variant="bar" />
      <RestaurantSearch />
    </div>
  );
}

export default LocationBar;
