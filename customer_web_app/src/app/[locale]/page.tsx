"use client";

import { useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import ShimmerHome from "@/components/Shimmer/ShimmerHome";
import WhatsOnYourMind from "@/components/Home/WhatsOnYourMind";
import TopRestaurant from "@/components/Home/TopRestaurant";
import Restaurants from "@/components/Home/Restaurants";

export default function HomePage() {
  useRestaurants();

  const restaurants = useAppSelector((state) => state.restaurants);

  if (restaurants.length <= 0) return <ShimmerHome />;

  return (
    <div className="container mx-auto mt-24 mb-10 px-2 sm:px-10 overflow-x-hidden">
      <WhatsOnYourMind />
      <div className="divider"></div>

      <TopRestaurant />
      <div className="divider"></div>

      <Restaurants />
    </div>
  );
}
