"use client";

import { useTranslations } from "next-intl";
import RestaurantCarousel from "@/components/Home/RestaurantCarousel";
import type { RestaurantDocument } from "@/types/restaurant";

function TopRated({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  if (restaurants.length < 4) return null;

  return (
    <>
      <div className="divider"></div>
      <RestaurantCarousel
        id="top-rated"
        title={t("Top rated near you")}
        subtitle={t("Top rated subtitle")}
        restaurants={restaurants}
      />
    </>
  );
}

export default TopRated;
