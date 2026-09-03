"use client";

import { useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import ShimmerHome from "@/components/Shimmer/ShimmerHome";
import HeroBanner from "@/components/Home/HeroBanner";
import ReorderSection from "@/components/Home/ReorderSection";
import WhatsOnYourMind from "@/components/Home/WhatsOnYourMind";
import PopularDishes from "@/components/Home/PopularDishes";
import {
  IS_REORDER_ENABLED,
  IS_POPULAR_DISHES_ENABLED,
} from "@/utils/featureFlags";
import Restaurants from "@/components/Home/Restaurants";
import CtaStrip from "@/components/Home/CtaStrip";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/rtk/hooks";
import { toggleOrderSidebar } from "@/rtk/slices/toggleSlice";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSyncExternalStore } from "react";
import { BikeIcon } from "lucide-react";
import { IS_COMING_SOON } from "@/utils/comingSoon";
import RestaurantSearch from "@/components/RestaurantSearch";

const emptySubscribe = () => () => {};

function greetingKey(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  return "Good evening";
}

function HomeGreeting() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const greeting = greetingKey(new Date());
  const { uid, isAuthenticated } = useAuthSession();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const user = useAppSelector((state) => state.user);

  const handleOrderTracking = () => {
    dispatch(toggleOrderSidebar());
    document.body.classList.add("overflow-hidden");
  };

  return (
    <>
      {!IS_COMING_SOON && user?.trackedOrder?.id && (
        <div className="px-4 pt-4 sm:px-10">
          <button
            type="button"
            onClick={handleOrderTracking}
            aria-label={t("Order Tracking")}
            className="order-pulse mx-auto flex items-center gap-2 rounded-full bg-color-11/10 px-4 py-2.5 text-sm font-ProximaNovaSemiBold text-color-11 transition-colors hover:bg-color-11/20 focus-visible:ring-2 focus-visible:ring-color-11/50 outline-none cursor-pointer"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-color-11 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-color-11" />
            </span>
            <BikeIcon className="size-4" />
            <span>{t("Order Track")}</span>
          </button>
        </div>
      )}

      <div className="px-4 pt-6 text-center sm:px-10">
        <p className="text-sm font-ProximaNovaSemiBold text-color-2">
          {t(greeting)}
        </p>
        <h1 className="mt-1 font-GrotBlack text-2xl tracking-tight text-color-1 sm:text-3xl">
          {t("Home greeting title")
            .split(/(Zajil|زاجل)/)
            .map((part, i) =>
              part === "Zajil" || part === "زاجل" ? (
                <span key={i} className="text-color-2">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
        </h1>
        <p className="mt-2 font-ProximaNovaBold text-lg text-color-5">
          {t("Home greeting subtitle")}
        </p>
      </div>

      <div className="px-4 pt-5 sm:px-10">
        <RestaurantSearch />
      </div>
    </>
  );
}

export default function HomePage() {
  useRestaurants();

  const restaurants = useAppSelector((state) => state.restaurants);

  if (restaurants.length <= 0) return <ShimmerHome />;

  return (
    <>
      <div className="container mx-auto overflow-x-clip px-0 pb-24 sm:px-10">
        <HomeGreeting />

        <WhatsOnYourMind />

        <div className="px-4 sm:px-0">
          <HeroBanner />
          {IS_REORDER_ENABLED && <ReorderSection />}

          {IS_POPULAR_DISHES_ENABLED && (
            <PopularDishes restaurants={restaurants} />
          )}

          <Restaurants />

          <CtaStrip />
        </div>
      </div>

    </>
  );
}