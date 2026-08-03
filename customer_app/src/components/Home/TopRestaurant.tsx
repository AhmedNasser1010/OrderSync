"use client";

import { useTranslations } from "next-intl";
import RestaurantCarousel from "@/components/Home/RestaurantCarousel";
import type { RestaurantDocument } from "@/types/restaurant";

function TopRestaurant({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  if (!restaurants || restaurants.length < 4) return null;

  return (
    <>
      <div className="divider"></div>
      <RestaurantCarousel
        id="top-chain"
        title={t("Top restaurant chains in El-Ayat")}
        restaurants={restaurants}
        cardWidth="w-80"
      />
    </>
  );
}

export default TopRestaurant;
