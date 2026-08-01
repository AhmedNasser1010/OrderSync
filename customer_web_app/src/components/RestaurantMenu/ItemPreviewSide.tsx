"use client";

import DishImage from "@/components/RestaurantMenu/DishImage";
import PlaceItemBtn from "@/components/RestaurantMenu/PlaceItemBtn";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const ItemPreviewSide = ({
  item,
  status,
  resID,
}: {
  item: ItemWithSelection;
  status: string;
  resID: string;
}) => {
  return (
    <div className="relative w-[118px] h-24">
      <DishImage item={item} />
      <PlaceItemBtn item={item} status={status} resID={resID} />
    </div>
  );
};

export default ItemPreviewSide;
