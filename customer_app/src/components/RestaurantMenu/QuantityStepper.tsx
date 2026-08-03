"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { quantityHandle } from "@/rtk/slices/cartSlice";
import useAddToCart from "@/hooks/useAddToCart";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const QuantityStepper = ({
  item,
  selectedSize,
  status,
  resID,
}: {
  item: ItemWithSelection;
  selectedSize?: string | null;
  status: string;
  resID: string;
}) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { handleAddItem } = useAddToCart(resID, status);
  const cartItems = useAppSelector((state) => state.cart.items);

  const cartItem = cartItems.find(
    (cartItem) =>
      cartItem?.id === item?.id &&
      (cartItem?.selectedSize ?? null) === (selectedSize ?? null)
  );

  const quantity = cartItem?.quantity ?? 0;

  const handleIncrease = () => {
    dispatch(
      quantityHandle({
        id: item.id,
        selectedSize: selectedSize ?? null,
        quantity: "+",
      })
    );
  };

  const handleDecrease = () => {
    dispatch(
      quantityHandle({
        id: item.id,
        selectedSize: selectedSize ?? null,
        quantity: "-",
      })
    );
  };

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => handleAddItem(item)}
        className="absolute -bottom-3 end-2 z-10 flex h-9 w-24 items-center justify-center rounded-md border border-color-11 bg-white font-ProximaNovaBold text-sm uppercase text-color-11 shadow-md shadow-color-7 transition-all hover:bg-color-11 hover:text-white focus-visible:ring-2 focus-visible:ring-color-11/50 outline-none cursor-pointer"
      >
        {t("Add")}
      </button>
    );
  }

  return (
    <div className="absolute -bottom-3 end-2 z-10 flex h-9 items-center overflow-hidden rounded-md border border-color-11 bg-white shadow-md shadow-color-7">
      <button
        type="button"
        onClick={handleDecrease}
        aria-label={t("Decrease")}
        className="grid h-full w-9 place-items-center text-color-11 transition-colors hover:bg-color-11 hover:text-white cursor-pointer"
      >
        <Minus className="size-4" />
      </button>
      <span className="grid h-full w-9 place-items-center border-x border-color-7 font-ProximaNovaBold text-sm text-color-11">
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        aria-label={t("Increase")}
        className="grid h-full w-9 place-items-center text-color-11 transition-colors hover:bg-color-11 hover:text-white cursor-pointer"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
};

export default QuantityStepper;
