"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import {
  priceAfterDiscount,
  resolveItemDiscount,
} from "@ordersync/order-utils";
import { selectItemSize } from "@/rtk/slices/menuSlice";
import type { ItemType, CategoryType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const getSizePrice = (item: ItemType, size: string | null): number => {
  const sizePrice = item.sizes?.find((s: SizeType) => s.size === size)?.price;
  return sizePrice ? Number(sizePrice) : item.price;
};

const useItemInfo = (item: ItemWithSelection, resID?: string) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const categories = useAppSelector((state) => state.menu.categories);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    item?.selectedSize?.size ?? null
  );
  const [itemPrice, setItemPrice] = useState<number>(
    getSizePrice(item, item?.selectedSize?.size ?? null)
  );
  const [afterDiscount, setAfterDiscount] = useState(() => {
    const category = categories?.find(
      (cat: CategoryType) => cat.id === item?.category
    );
    const effectiveDiscount = resolveItemDiscount(item, category);
    return effectiveDiscount?.code
      ? priceAfterDiscount(itemPrice, effectiveDiscount, user, resID || "")
      : { finalPrice: itemPrice, isAvailableForUser: false };
  });
  const [discountIncluded, setDiscountIncluded] = useState(
    afterDiscount?.isAvailableForUser
      ? itemPrice != afterDiscount?.finalPrice
      : false
  );

  const handleSetSelectedSize = (size: string) => {
    setSelectedSize(size);
    const newPrice = getSizePrice(item, size);
    setItemPrice(newPrice);
    const category = categories?.find(
      (cat: CategoryType) => cat.id === item?.category
    );
    const effectiveDiscount = resolveItemDiscount(item, category);
    const result = effectiveDiscount?.code
      ? priceAfterDiscount(newPrice, effectiveDiscount, user, resID || "")
      : { finalPrice: newPrice, isAvailableForUser: false };
    setAfterDiscount(result);
    setDiscountIncluded(
      result?.isAvailableForUser ? newPrice != result?.finalPrice : false
    );
    dispatch(
      selectItemSize({
        id: item.id,
        selectedSize: item.sizes?.find((s: SizeType) => s.size === size) ?? null,
      })
    );
  };

  return {
    selectedSize,
    itemPrice,
    afterDiscount,
    discountIncluded,
    handleSetSelectedSize,
  };
};

export default useItemInfo;
