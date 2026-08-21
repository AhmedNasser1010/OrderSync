"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import ItemAvailability from "@/components/RestaurantMenu/ItemAvailability";
import ItemTitle from "@/components/RestaurantMenu/ItemTitle";
import DiscountMsg from "@/components/RestaurantMenu/DiscountMsg";
import ItemPrice from "@/components/RestaurantMenu/ItemPrice";
import ItemDescription from "@/components/RestaurantMenu/ItemDescription";
import ItemSizesBar from "@/components/RestaurantMenu/ItemSizesBar";
import QuantityStepper from "@/components/RestaurantMenu/QuantityStepper";
import ImageViewer from "@/components/RestaurantMenu/ImageViewer";
import useItemInfo from "@/hooks/useItemInfo";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const MenuItemCard = ({
  item,
  resID,
  status,
}: {
  item: ItemWithSelection;
  resID: string;
  status: string;
}) => {
  const t = useTranslations();
  const [viewerOpen, setViewerOpen] = useState(false);
  const {
    selectedSize,
    itemPrice,
    afterDiscount,
    discountIncluded,
    handleSetSelectedSize,
  } = useItemInfo(item, resID);

  const percentOff =
    discountIncluded && itemPrice > 0 && afterDiscount?.finalPrice
      ? Math.round((1 - afterDiscount.finalPrice / itemPrice) * 100)
      : 0;
  const hasDiscountMsg = Boolean(discountIncluded && item?.discount?.message);

  return (
    <div className="flex items-start justify-between gap-4 py-6">
      <div className="min-w-0 flex-1">
        <ItemAvailability />
        <ItemTitle title={item?.title} discountIncluded={discountIncluded} />
        <DiscountMsg
          discountMsg={discountIncluded ? item?.discount?.message : null}
          discountIncluded={discountIncluded}
        />
        <ItemPrice
          price={itemPrice}
          finalPrice={afterDiscount?.finalPrice}
          discountIncluded={discountIncluded}
          hidePercentOff={hasDiscountMsg}
        />
        <ItemDescription description={item?.description} />
        <ItemSizesBar
          item={item}
          selectedSize={selectedSize}
          handleSetSelectedSize={handleSetSelectedSize}
        />
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          aria-label={t("View image")}
          className="group relative block h-28 w-32 cursor-zoom-in overflow-hidden rounded-2xl bg-color-7 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none sm:h-36 sm:w-44"
        >
          <Image
            src={item?.backgrounds?.[0] || "/assets/FoodAndDrinkDesign.svg"}
            alt={item?.title || "menu-img"}
            loading="lazy"
            fill
            sizes="(min-width: 640px) 176px, 128px"
            className="rounded-2xl object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {percentOff > 0 && !hasDiscountMsg && (
            <span className="absolute top-2 start-2 z-10 rounded-full bg-gradient-to-r from-color-2 to-[#ffab4a] px-3 py-1 font-ProximaNovaBold text-xs uppercase tracking-wide text-white shadow-lg shadow-color-2/30">
              {percentOff}% {t("OFF")}
            </span>
          )}
        </button>
        <QuantityStepper
          item={item}
          selectedSize={selectedSize}
          status={status}
          resID={resID}
        />
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

export default MenuItemCard;
