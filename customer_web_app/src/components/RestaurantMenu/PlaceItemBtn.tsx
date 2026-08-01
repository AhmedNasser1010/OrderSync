"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  addToCart,
  setRestaurant,
} from "@/rtk/slices/cartSlice";
import {
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
} from "@/rtk/slices/toggleSlice";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const PlaceItemBtn = ({
  item,
  status,
  resID,
}: {
  item: ItemWithSelection;
  status: string;
  resID: string;
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const currentResId = useAppSelector((state) => state.cart.restaurant);
  const trackedOrder = useAppSelector((state) => state.user?.trackedOrder);
  const menuItems = useAppSelector((state) => state.menu.items);

  const handleAddItem = (item: ItemWithSelection) => {
    if (status === "inactive" || status === "pause") {
      dispatch(setShowResClosedPopup(true));
      return;
    }

    const itemFromCart = menuItems.find(
      (menuItem) => menuItem.id === item.id
    ) as ItemWithSelection | undefined;

    if (!itemFromCart) return;

    const menuItem: ItemWithSelection = {
      ...itemFromCart,
      selectedSize: itemFromCart?.selectedSize || item?.selectedSize,
    };

    const isItemInCart = cartItems.some(
      (cartItem) =>
        cartItem?.id === menuItem?.id &&
        (cartItem?.selectedSize === null ||
          cartItem?.selectedSize === menuItem?.selectedSize?.size)
    );

    const isSameRes = currentResId === "" ? true : resID === currentResId;
    const hasActiveTrackedOrder = Boolean(trackedOrder?.id);

    if (isItemInCart) {
      toast.error(t("Already added to the Cart"), {
        position: "top-center",
        duration: 1500,
      });
    } else {
      if (isSameRes) {
        toast.success(t("Added to the Cart"), {
          position: "top-center",
          duration: 1500,
        });
        dispatch(
          addToCart({
            id: menuItem.id,
            quantity: 1,
            selectedSize: menuItem?.selectedSize?.size || null,
          })
        );
        dispatch(setRestaurant(resID));
        dispatch(setShowItemsAlreadyInCartPopup(false));
        dispatch(setShowTrackedOrderLockPopup(false));
      } else {
        if (hasActiveTrackedOrder) {
          dispatch(setShowTrackedOrderLockPopup(true));
        } else {
          dispatch(setShowItemsAlreadyInCartPopup(true));
        }
      }
    }
  };

  return (
    <button
      onClick={() => handleAddItem(item)}
      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-[1] w-24 h-9 shadow-md shadow-color-7 bg-white text-center inline-block rounded text-[#60b246] text-sm ${
        locale === "ar" ? "font-Beiruti font-bold" : "font-ProximaNovaSemiBold"
      } uppercase`}
    >
      {t("Add")}
    </button>
  );
};

export default PlaceItemBtn;
