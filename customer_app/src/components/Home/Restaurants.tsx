"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useAppSelector } from "@/rtk/hooks";
import { useTranslations } from "next-intl";
import RestaurantsFilter from "@/components/Home/RestaurantsFilter";
import RestaurantCard from "@/components/ui/custom/RestaurantCard";
import NoRestaurants from "@/components/Home/NoRestaurants";
import { toCardInfo } from "@/components/Home/cardInfo";
import type { RestaurantDocument } from "@/types/restaurant";

function Restaurants() {
  const t = useTranslations();
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
    <section id="restaurants">
      <h2 className="font-GrotBlack text-2xl pb-5 pt-5 2xl:text-start text-center sm:px-0 px-2">
        {t("Restaurants with online food delivery in El Ayat")}
      </h2>

      <RestaurantsFilter />

      {filteredRestaurants && filteredRestaurants.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10 px-6">
          {filteredRestaurants.map((res: RestaurantDocument) => (
            <Link
              className="relative block transition-all hover:scale-95"
              key={res?.accessToken}
              href={`/${res?.profile.name.split(" ").join("-")}`}
            >
              <RestaurantCard info={toCardInfo(res, t)} />
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
