"use client";

import { useTranslations } from "next-intl";
import RestaurantCarousel from "@/components/Home/RestaurantCarousel";
import type { RestaurantDocument } from "@/types/restaurant";

function FastDelivery({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  if (restaurants.length < 4) return null;

  return (
    <>
      <div className="divider"></div>
      <RestaurantCarousel
        id="fast-delivery"
        title={t("Fast delivery")}
        subtitle={t("Fast delivery subtitle")}
        restaurants={restaurants}
        cardWidth="w-80"
      />
    </>
  );
}

export default FastDelivery;
