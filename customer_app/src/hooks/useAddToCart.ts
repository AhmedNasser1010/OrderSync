"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addToCart, setRestaurant } from "@/rtk/slices/cartSlice";
import {
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
} from "@/rtk/slices/toggleSlice";
import workingDaysChecker from "@/utils/workingDaysChecker";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const useAddToCart = (resID: string, status: string) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  // Cooldown guard so "Add" cannot be spammed to push duplicate cart items.
  const lastAddAtRef = useRef(0);
  const cartItems = useAppSelector((state) => state.cart.items);
  const currentResId = useAppSelector((state) => state.cart.restaurant);
  const trackedOrder = useAppSelector((state) => state.user?.trackedOrder);
  const menuItems = useAppSelector((state) => state.menu.items);
  const restaurants = useAppSelector((state) => state.restaurants);

  const handleAddItem = (item: ItemWithSelection) => {
    // Throttle rapid "Add" taps (e.g. fast clicking/tapping) to prevent
    // duplicate cart entries or accidental multi-adds for the same item.
    const now = Date.now();
    if (now - lastAddAtRef.current < 250) {
      return;
    }
    lastAddAtRef.current = now;

    const resDoc = restaurants?.find(
      (restaurant) => restaurant.accessToken === resID
    );
    const resOpeningHours = resDoc?.operations?.openingHours;
    const resOpenNowUntil = resDoc?.operations?.openNowUntil;

    if (
      status === "inactive" ||
      status === "pause" ||
      status === "hidden" ||
      workingDaysChecker(resOpeningHours, undefined, resOpenNowUntil) === false
    ) {
      dispatch(setShowResClosedPopup(true));
      return;
    }

    if (trackedOrder?.id) {
      dispatch(setShowTrackedOrderLockPopup(true));
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

    if (isItemInCart) {
      toast.error(t("Already added to the Cart"), {
        position: "top-center",
        duration: 1500,
      });
      return;
    }

    if (isSameRes) {
      dispatch(
        addToCart({
          id: menuItem.id,
          quantity: 1,
          selectedSize: menuItem?.selectedSize?.size || null,
        })
      );
      dispatch(setRestaurant(resID));
      dispatch(setShowItemsAlreadyInCartPopup(false));
      return;
    }

    dispatch(setShowItemsAlreadyInCartPopup(true));
  };

  return { handleAddItem };
};

export default useAddToCart;
