"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import useRestaurantMenu from "@/hooks/useRestaurantMenu";
import RestaurantInfo from "@/components/RestaurantMenu/RestaurantInfo";
import RestaurantCategory from "@/components/RestaurantMenu/RestaurantCategory";
import ShimmerMenu from "@/components/Shimmer/ShimmerMenu";
import MenuPopups from "@/components/RestaurantMenu/MenuPopups";
import { resetPopupStates } from "@/rtk/slices/toggleSlice";
import type { RestaurantDocument } from "@/types/restaurant";

const inactiveMsg = "restaurantClosedMessage";
const busyMsg = "restaurantBusyMessage";
const pauseMsg = "restaurantPausedMessage";

export default function RestaurantMenuPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { slug } = useParams<{ slug: string }>();

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
    avgRating: "4.5",
    totalRatingsString: t("500+ ratings"),
  };

  const isMenuLoaded =
    Boolean(menu?.categories?.length) && res?.accessToken === menu.accessToken;

  useEffect(() => {
    if (!isMenuLoaded) return;
    const hash = window.location.hash;
    const el = hash ? document.querySelector(hash) : null;
    el?.scrollIntoView();
  }, [isMenuLoaded]);

  if (!isMenuLoaded) return <ShimmerMenu />;

  return (
    <div className="mx-auto mt-24 mb-10 2xl:w-1/2 md:w-4/5 sm:px-7 px-2">
      <RestaurantInfo resMainInfo={resMainInfo} />
      <hr className="border-1 border-dashed border-b-[#d3d3d3] my-4" />

      {status !== "active" && (
        <p
          className={`w-fit mx-auto px-3 py-1 rounded-full text-base font-medium ${
            status === "inactive"
              ? "bg-red-100 text-red-800"
              : status === "busy"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {t(
            status === "inactive"
              ? inactiveMsg
              : status === "busy"
              ? busyMsg
              : pauseMsg
          )}
        </p>
      )}

      <ul className="main-menu-container">
        {menu?.categories?.map((category, i) => (
          <li
            key={category?.id}
            className="cursor-pointer"
            id={`category-${i + 1} ${category.id}`}
          >
            <RestaurantCategory
              categoryID={category?.id}
              categoryTitle={category?.title}
              resID={res?.accessToken || ""}
              status={status}
            />
          </li>
        ))}
      </ul>

      <MenuPopups />
    </div>
  );
}
