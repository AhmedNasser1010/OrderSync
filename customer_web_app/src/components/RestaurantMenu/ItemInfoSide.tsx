"use client";

import ItemAvailability from "@/components/RestaurantMenu/ItemAvailability";
import ItemTitle from "@/components/RestaurantMenu/ItemTitle";
import DiscountMsg from "@/components/RestaurantMenu/DiscountMsg";
import ItemPrice from "@/components/RestaurantMenu/ItemPrice";
import ItemDescription from "@/components/RestaurantMenu/ItemDescription";
import ItemSizesBar from "@/components/RestaurantMenu/ItemSizesBar";
import useItemInfo from "@/hooks/useItemInfo";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const ItemInfoSide = ({
  item,
  resID,
}: {
  item: ItemWithSelection;
  resID: string;
}) => {
  const {
    selectedSize,
    itemPrice,
    afterDiscount,
    discountIncluded,
    handleSetSelectedSize,
  } = useItemInfo(item, resID);

  return (
    <div className="md:w-auto w-3/5">
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
      />
      <ItemDescription description={item?.description} />
      <ItemSizesBar
        item={item}
        selectedSize={selectedSize}
        handleSetSelectedSize={handleSetSelectedSize}
      />
    </div>
  );
};

export default ItemInfoSide;
