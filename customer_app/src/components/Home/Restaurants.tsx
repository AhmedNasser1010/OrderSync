"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { clearAll } from "@/rtk/slices/filterSlice";
import { useTranslations } from "next-intl";
import RestaurantsFilter from "@/components/Home/RestaurantsFilter";
import RestaurantCard from "@/components/ui/custom/RestaurantCard";
import NoRestaurants from "@/components/Home/NoRestaurants";
import SectionHeader from "@/components/Home/SectionHeader";
import { toCardInfo } from "@/components/Home/cardInfo";
import type { RestaurantDocument } from "@/types/restaurant";

function Restaurants() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);
  const restaurants = useAppSelector((state) => state.restaurants);

  const filteredRestaurants = useMemo(() => {
    if (filter.length && restaurants.length) {
      return restaurants.filter((res: RestaurantDocument) =>
        filter.some((tag) =>
          tag === "offers"
            ? res?.hasOffers
            : res?.profile?.cuisines?.includes(tag)
        )
      );
    }
    return restaurants;
  }, [restaurants, filter]);

  return (
    <section id="restaurants" className="pt-8">
      <SectionHeader
        title={t("Nearby Restaurants")}
        action={
          filter.length > 0 ? (
            <button
              className="font-GrotMed text-sm text-color-5 hover:text-color-1 transition-colors"
              onClick={() => dispatch(clearAll())}
            >
              {t("View all")}
            </button>
          ) : undefined
        }
      />

      <RestaurantsFilter />

      {filteredRestaurants && filteredRestaurants.length ? (
        <div className={`mt-6 grid ${filter.length > 0 ? "grid-cols-2 gap-x-4 gap-y-8 sm:px-0" : "grid-cols-1 gap-y-3 px-6"} lg:grid-cols-3 xl:grid-cols-4`}>
          {filteredRestaurants.map((res: RestaurantDocument) => (
            <Link
              className="relative block transition-all hover:scale-95"
              key={res?.accessToken}
              href={`/${res?.profile.name.split(" ").join("-")}`}
            >
              <RestaurantCard info={toCardInfo(res, t)} compact={filter.length > 0} />
            </Link>
          ))}
        </div>
      ) : (
        <NoRestaurants />
      )}
    </section>
  );
}

export default Restaurants;
