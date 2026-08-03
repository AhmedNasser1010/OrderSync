"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, SearchX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import useRestaurantMenu from "@/hooks/useRestaurantMenu";
import RestaurantHero from "@/components/RestaurantMenu/RestaurantHero";
import StickyMenuNav from "@/components/RestaurantMenu/StickyMenuNav";
import MenuSection from "@/components/RestaurantMenu/MenuSection";
import MenuItemCard from "@/components/RestaurantMenu/MenuItemCard";
import FloatingCartBar from "@/components/RestaurantMenu/FloatingCartBar";
import ShimmerMenu from "@/components/Shimmer/ShimmerMenu";
import MenuPopups from "@/components/RestaurantMenu/MenuPopups";
import { resetPopupStates } from "@/rtk/slices/toggleSlice";
import type { RestaurantDocument } from "@/types/restaurant";
import type { ItemType, SizeType } from "@ordersync/types";

const inactiveMsg = "restaurantClosedMessage";
const busyMsg = "restaurantBusyMessage";
const pauseMsg = "restaurantPausedMessage";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

export default function RestaurantMenuPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const [query, setQuery] = useState("");

  useRestaurants();

  const restaurants = useAppSelector((state) => state.restaurants);
  const menu = useAppSelector((state) => state.menu);

  const res = useMemo(
    () =>
      restaurants.find(
        (restaurant: RestaurantDocument) =>
          restaurant.profile.name === slug.split("-").join(" ")
      ),
    [slug, restaurants]
  );

  useRestaurantMenu(res?.accessToken);

  useEffect(() => {
    if (restaurants.length && !res) {
      router.replace("/");
    }
  }, [res, restaurants, router]);

  useEffect(() => {
    dispatch(resetPopupStates());
  }, [dispatch]);

  const resName = locale === "ar" ? res?.profile?.nameInAr : res?.profile?.name;
  const status = res?.status || "pause";

  const resMainInfo = {
    city: t("El-Ayat"),
    name: resName,
    cuisines: res?.profile?.cuisines,
    areaName: t("El-Ayat"),
    sla: `${res?.operations?.cookTime?.[0]}-${res?.operations?.cookTime?.[1]} ${t("min")}`,
  };

  const isMenuLoaded =
    Boolean(menu?.categories?.length) && res?.accessToken === menu.accessToken;

  useEffect(() => {
    if (!isMenuLoaded) return;
    const hash = window.location.hash;
    const el = hash ? document.querySelector(hash) : null;
    el?.scrollIntoView();
  }, [isMenuLoaded]);

  const statusMsgKey =
    status === "inactive" ? inactiveMsg : status === "busy" ? busyMsg : pauseMsg;

  const searchedItems = useMemo<ItemWithSelection[]>(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return menu.items
      .filter((item) => item.visibility !== false)
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(normalized) ||
          item.description?.toLowerCase().includes(normalized)
      )
      .map((item) => ({
        ...item,
        selectedSize:
          item?.sizes?.length && item?.sizes?.[0]?.price && item?.sizes?.[0]
            ? item.sizes[0]
            : null,
      }));
  }, [query, menu.items]);

  const isSearching = query.trim().length > 0;

  const visibleCategories = useMemo(
    () => menu.categories.filter((category) => category.visibility !== false),
    [menu.categories]
  );

  if (!isMenuLoaded) return <ShimmerMenu />;

  return (
    <div className="-mt-20 min-h-screen pb-32">
      {res && (
        <RestaurantHero res={res} resMainInfo={resMainInfo} />
      )}

      <StickyMenuNav
        categories={visibleCategories}
        query={query}
        onSearchChange={setQuery}
      />

      <div className="mx-auto mt-6 w-full px-4 sm:px-7 md:w-4/5 2xl:max-w-5xl">
        {status !== "active" && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              status === "inactive"
                ? "border-red-200 bg-red-50 text-red-800"
                : status === "busy"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-color-7 bg-color-7/40 text-color-6"
            }`}
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p className="font-ProximaNovaMed text-sm leading-relaxed">
              {t(statusMsgKey)}
            </p>
          </div>
        )}

        {isSearching ? (
          <div>
            <h2 className="py-5 font-ProximaNovaBold text-xl text-color-1 sm:text-2xl">
              {t("Search results")}
            </h2>
            {searchedItems.length ? (
              <div>
                {searchedItems.map((item) => (
                  <div
                    key={item?.id}
                    className="border-b border-dashed border-color-7 last:border-none"
                  >
                    <MenuItemCard
                      item={item}
                      resID={res?.accessToken || ""}
                      status={status}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-color-7 py-16 text-center">
                <SearchX className="size-10 text-color-5" />
                <p className="font-ProximaNovaMed text-color-6">
                  {t("No items found")}
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-full bg-color-2 px-5 py-2 font-ProximaNovaSemiBold text-sm text-white transition-colors hover:bg-color-2/90 cursor-pointer"
                >
                  {t("Clear search")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {visibleCategories.map((category) => (
              <MenuSection
                key={category.id}
                category={category}
                resID={res?.accessToken || ""}
                status={status}
              />
            ))}
          </div>
        )}
      </div>

      <MenuPopups />
      <FloatingCartBar resID={res?.accessToken || ""} />
    </div>
  );
}
