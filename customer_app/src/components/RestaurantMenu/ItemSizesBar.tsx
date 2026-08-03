"use client";

import { useTranslations } from "next-intl";
import SizeOptionBtn from "@/components/RestaurantMenu/SizeOptionBtn";
import type { ItemType, SizeType } from "@ordersync/types";

const options: Record<string, string> = {
  S: "Small",
  M: "Medium",
  L: "Large",
};

const ItemSizesBar = ({
  item,
  selectedSize,
  handleSetSelectedSize = () => {},
}: {
  item: ItemType;
  selectedSize?: string | null;
  handleSetSelectedSize?: (size: string) => void;
}) => {
  const t = useTranslations();
  return (
    <div
      className={`${
        !selectedSize && "hidden"
      } flex row overflow-hidden w-fit border border-gray-500 border-dashed text-xs mt-2.5 font-ProximaNovaThin`}
    >
      {item?.sizes?.map(
        (option: SizeType) =>
          option?.price && (
            <SizeOptionBtn
              key={option?.size}
              isSelected={selectedSize === option?.size}
              onMouseUp={() => handleSetSelectedSize(option?.size)}
            >
              {t(options[option?.size])}
            </SizeOptionBtn>
          )
      )}
    </div>
  );
};

export default ItemSizesBar;
