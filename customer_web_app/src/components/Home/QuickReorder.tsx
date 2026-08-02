"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/rtk/hooks";
import RestaurantCarousel from "@/components/Home/RestaurantCarousel";
import type { RestaurantDocument } from "@/types/restaurant";

function QuickReorder({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();
  const user = useAppSelector((state) => state.user);

  const reorderRestaurants = useMemo(() => {
    const history = Array.isArray(user?.restaurants) ? user.restaurants : [];
    if (history.length === 0) return [];

    const byId = new Map(
      restaurants.map((r) => [r.accessToken, r] as [string, RestaurantDocument])
    );

    return history
      .slice()
      .sort((a, b) => b.lastOrderTime - a.lastOrderTime)
      .map((entry) => byId.get(entry.accessToken))
      .filter((r): r is RestaurantDocument => Boolean(r))
      .slice(0, 8);
  }, [user, restaurants]);

  if (reorderRestaurants.length < 2) return null;

  return (
    <>
      <div className="divider"></div>
      <RestaurantCarousel
        id="quick-reorder"
        title={t("Order again")}
        subtitle={t("Order again subtitle")}
        restaurants={reorderRestaurants}
        cardWidth="w-80"
      />
    </>
  );
}

export default QuickReorder;
