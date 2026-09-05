"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  addToCart,
  clearCart,
  setRestaurant,
} from "@/rtk/slices/cartSlice";
import { useFetchLastOrderQuery, useFetchMenuDataQuery } from "@/rtk/api/firestoreApi";
import { validateReorder } from "@/lib/reorder";
import { ReorderSkeleton } from "@/components/Shimmer/HomeSkeletons";
import type { MainMenuType, OrderType, ItemType } from "@ordersync/types";
import type { RestaurantDocument } from "@/types/restaurant";

const reasonToMessageKey: Record<string, string> = {
  "restaurant-unavailable": "Reorder unavailable",
  "restaurant-closed": "Restaurant is closed right now",
  "items-changed": "Some items are no longer available",
};

function ReorderSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const user = useAppSelector((state) => state.user);
  const restaurants = useAppSelector(
    (state) => state.restaurants
  ) as RestaurantDocument[];
  const hasTrackedOrder = Boolean(user?.trackedOrder?.id);

  const { data: lastOrder, isLoading } = useFetchLastOrderQuery(
    user?.uid ? user.uid : skipToken
  );

  const restaurant = useMemo(
    () =>
      lastOrder
        ? restaurants.find((r) => r.accessToken === lastOrder.businessId)
        : undefined,
    [lastOrder, restaurants]
  );

  const { data: menuData } = useFetchMenuDataQuery(
    lastOrder?.businessId ? lastOrder.businessId : skipToken
  );

  const validation = useMemo(() => {
    if (!lastOrder || !menuData) return null;
    return validateReorder(
      lastOrder as unknown as Parameters<typeof validateReorder>[0],
      restaurants,
      ((menuData as MainMenuType).items || []) as ItemType[]
    );
  }, [lastOrder, menuData, restaurants]);

  const disabled =
    !validation ||
    !validation.ok ||
    hasTrackedOrder ||
    isLoading;

  const resName = locale === "ar"
    ? restaurant?.profile?.nameInAr
    : restaurant?.profile?.name;

  const itemCount =
    lastOrder?.cart?.reduce((acc, line) => acc + (line.quantity || 0), 0) ?? 0;

  const handleReorder = () => {
    if (!lastOrder || !validation?.ok) return;

    dispatch(clearCart());
    for (const line of lastOrder.cart ?? []) {
      dispatch(
        addToCart({
          id: line.id,
          quantity: line.quantity,
          selectedSize: line.selectedSize ?? null,
        })
      );
    }
    dispatch(setRestaurant(lastOrder.businessId as string));
    router.push("/cart");
  };

  if (!user?.uid) return null;
  if (isLoading) return <ReorderSkeleton />;
  if (!lastOrder || !(lastOrder as Partial<OrderType>).id) return null;

  const hintKey = hasTrackedOrder
    ? "Finish your current order first"
    : validation && !validation.ok
      ? reasonToMessageKey[validation.reason]
      : undefined;

  return (
    <section className="pt-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-color-7 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-color-7">
            {restaurant?.branding?.icon && (
              <Image
                src={restaurant.branding.icon}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-GrotBlack text-lg tracking-tight text-color-1">
              {t("Reorder your last order")}
            </h2>
            <p className="mt-0.5 truncate text-sm font-ProximaNovaThin text-color-5">
              {resName} · {itemCount} {t(itemCount === 1 ? "item" : "items")}
            </p>
            {hintKey && (
              <p className="mt-0.5 truncate text-xs font-ProximaNovaThin text-red-500">
                {t(hintKey)}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleReorder}
          disabled={disabled}
          title={hintKey ? t(hintKey) : undefined}
          className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-color-2 px-6 py-2.5 font-ProximaNovaSemiBold text-sm text-white transition-all hover:bg-color-2/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-color-2"
        >
          <RotateCcw className="size-4" />
          {t("Reorder")}
        </button>
      </div>
    </section>
  );
}

export default ReorderSection;
