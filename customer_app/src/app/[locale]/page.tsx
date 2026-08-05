"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import ShimmerHome from "@/components/Shimmer/ShimmerHome";
import LocationBar from "@/components/Home/LocationBar";
import HeroBanner from "@/components/Home/HeroBanner";
// import Offers from "@/components/Home/Offers";
import WhatsOnYourMind from "@/components/Home/WhatsOnYourMind";
import TopRestaurant from "@/components/Home/TopRestaurant";
import PopularDishes from "@/components/Home/PopularDishes";
import Restaurants from "@/components/Home/Restaurants";
import Reviews from "@/components/Home/Reviews";
import CtaStrip from "@/components/Home/CtaStrip";

export default function HomePage() {
  useRestaurants();

  const restaurants = useAppSelector((state) => state.restaurants);

  const sections = useMemo(() => {
    if (!restaurants.length) return null;

    const topChains = restaurants.filter((r) => r.topChains);

    const offers = restaurants.filter((r) => r.hasOffers);

    return { topChains, offers };
  }, [restaurants]);

  if (restaurants.length <= 0 || !sections) return <ShimmerHome />;

  return (
    <div className="container mx-auto mb-10 px-2 sm:px-10 overflow-x-hidden">
      <LocationBar />
      <HeroBanner />
      {/* <Offers restaurants={sections.offers} /> */}
      <WhatsOnYourMind />
      <TopRestaurant restaurants={sections.topChains} />
      <PopularDishes restaurants={restaurants} />
      <div className="divider"></div>
      <Restaurants />
      <Reviews restaurants={restaurants} />
      <CtaStrip />
    </div>
  );
}
