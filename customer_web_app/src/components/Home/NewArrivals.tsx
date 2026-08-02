"use client";

import { useTranslations } from "next-intl";
import RestaurantCarousel from "@/components/Home/RestaurantCarousel";
import type { RestaurantDocument } from "@/types/restaurant";

function NewArrivals({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  if (restaurants.length < 4) return null;

  return (
    <>
      <div className="divider"></div>
      <RestaurantCarousel
        id="new-arrivals"
        title={t("New on Zack's Eats")}
        subtitle={t("New arrivals subtitle")}
        restaurants={restaurants}
      />
    </>
  );
}

export default NewArrivals;
