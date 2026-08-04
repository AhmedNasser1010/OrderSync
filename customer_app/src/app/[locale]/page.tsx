"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import ShimmerHome from "@/components/Shimmer/ShimmerHome";
import LocationBar from "@/components/Home/LocationBar";
import HeroBanner from "@/components/Home/HeroBanner";
import QuickReorder from "@/components/Home/QuickReorder";
import Offers from "@/components/Home/Offers";
import WhatsOnYourMind from "@/components/Home/WhatsOnYourMind";
import FastDelivery from "@/components/Home/FastDelivery";
import TopRestaurant from "@/components/Home/TopRestaurant";
import TopRated from "@/components/Home/TopRated";
import NewArrivals from "@/components/Home/NewArrivals";
import PopularDishes from "@/components/Home/PopularDishes";
import Restaurants from "@/components/Home/Restaurants";
import Reviews from "@/components/Home/Reviews";
import CtaStrip from "@/components/Home/CtaStrip";
import type { RestaurantDocument } from "@/types/restaurant";

export default function HomePage() {
  useRestaurants();

  const restaurants = useAppSelector((state) => state.restaurants);

  const sections = useMemo(() => {
    if (!restaurants.length) return null;

    const shown = new Set<string>();
    const markShown = (list: RestaurantDocument[]) => {
      list.forEach((r) => shown.add(r.accessToken));
    };

    const topChains = restaurants.filter((r) => r.topChains);
    markShown(topChains);

    const offers = restaurants.filter(
      (r) => r.branding?.promotionalSubtitle && !shown.has(r.accessToken)
    );
    markShown(offers);

    const rest = restaurants.filter((r) => !shown.has(r.accessToken));
    const topRated = [...rest]
      .filter((r) => r.status === "active")
      .sort(
        (a, b) =>
          Number(b.reviewSummary?.averageRating ?? 0) -
          Number(a.reviewSummary?.averageRating ?? 0)
      )
      .slice(0, 10);
    markShown(topRated);

    const rest2 = restaurants.filter((r) => !shown.has(r.accessToken));
    const newArrivals = [...rest2]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
    markShown(newArrivals);

    const fast = restaurants
      .filter((r) => (r.operations?.cookTime?.[1] ?? 0) <= 20)
      .slice(0, 8);

    return { topChains, offers, topRated, newArrivals, fast };
  }, [restaurants]);

  if (restaurants.length <= 0 || !sections) return <ShimmerHome />;

  return (
    <div className="container mx-auto mb-10 px-2 sm:px-10 overflow-x-hidden">
      <LocationBar /> {/* Checked */}
      <HeroBanner /> {/* Checked */}
      <QuickReorder restaurants={restaurants} />
      <Offers restaurants={sections.offers} />
      <WhatsOnYourMind />
      <FastDelivery restaurants={sections.fast} />
      <TopRestaurant restaurants={sections.topChains} />
      <TopRated restaurants={sections.topRated} />
      <NewArrivals restaurants={sections.newArrivals} />
      <PopularDishes restaurants={restaurants} />
      <div className="divider"></div>
      <Restaurants />
      <Reviews restaurants={restaurants} />
      <CtaStrip />
    </div>
  );
}
