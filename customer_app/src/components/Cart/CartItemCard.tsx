"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ItemAvailability from "@/components/RestaurantMenu/ItemAvailability";
import ItemTitle from "@/components/RestaurantMenu/ItemTitle";
import DiscountMsg from "@/components/RestaurantMenu/DiscountMsg";
import ItemPrice from "@/components/RestaurantMenu/ItemPrice";
import ItemDescription from "@/components/RestaurantMenu/ItemDescription";
import ItemSizesBar from "@/components/RestaurantMenu/ItemSizesBar";
import ImageViewer from "@/components/RestaurantMenu/ImageViewer";
import type { ItemType } from "@ordersync/types";

type SelectedItem = ItemType & { quantity: number; selectedSize?: string | null };

const CartItemCard = ({
  item,
  price,
  finalPrice,
  discountIncluded,
  discountMsg,
  disabled,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: SelectedItem;
  price: number;
  finalPrice: number;
  discountIncluded: boolean;
  discountMsg?: string | null;
  disabled?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) => {
  const t = useTranslations();
  const [viewerOpen, setViewerOpen] = useState(false);

  const percentOff =
    discountIncluded && price > 0 && finalPrice < price
      ? Math.round((1 - finalPrice / price) * 100)
      : 0;

  return (
    <div className="flex items-start justify-between gap-4 py-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ItemAvailability />
          <ItemTitle title={item?.title} discountIncluded={discountIncluded} />
        </div>
        <DiscountMsg
          discountMsg={discountMsg}
          discountIncluded={discountIncluded}
        />
        <ItemPrice
          price={price}
          finalPrice={finalPrice}
          discountIncluded={discountIncluded}
        />
        <ItemDescription description={item?.description} />
        <ItemSizesBar item={item} selectedSize={item?.selectedSize} />

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-9 items-center overflow-hidden rounded-md border border-color-11 bg-white shadow-sm dark:bg-card">
            <button
              type="button"
              onClick={onDecrease}
              disabled={disabled}
              aria-label={t("Decrease")}
              className="grid h-full w-9 place-items-center text-color-11 transition-colors hover:bg-color-11 hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <Minus className="size-4" />
            </button>
            <span className="grid h-full min-w-9 place-items-center border-x border-color-7 px-1 font-ProximaNovaBold text-sm text-color-11">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={disabled}
              aria-label={t("Increase")}
              className="grid h-full w-9 place-items-center text-color-11 transition-colors hover:bg-color-11 hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={t("Remove")}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-ProximaNovaMed text-color-5 transition-colors hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="size-4" />
            {t("Remove")}
          </button>
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          aria-label={t("View image")}
          className="group relative block h-24 w-28 cursor-zoom-in overflow-hidden rounded-2xl bg-color-7 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none sm:h-28 sm:w-32"
        >
          <Image
            src={item?.backgrounds?.[0] || "/assets/FoodAndDrinkDesign.svg"}
            alt={item?.title || "menu-img"}
            loading="lazy"
            fill
            sizes="(min-width: 640px) 128px, 112px"
            className="rounded-2xl object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {percentOff > 0 && (
            <span className="absolute top-2 start-2 z-10 rounded-full bg-gradient-to-r from-color-2 to-[#ffab4a] px-3 py-1 font-ProximaNovaBold text-xs uppercase tracking-wide text-white shadow-lg shadow-color-2/30">
              {percentOff}% {t("OFF")}
            </span>
          )}
        </button>
      </div>

      <ImageViewer
        src={item?.backgrounds?.[0] || "/assets/FoodAndDrinkDesign.svg"}
        alt={item?.title}
        onClose={() => setViewerOpen(false)}
        open={viewerOpen}
      />
    </div>
  );
};

export default CartItemCard;
