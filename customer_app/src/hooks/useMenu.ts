"use client";

import { useAppSelector } from "@/rtk/hooks";
import { priceAfterDiscount } from "@ordersync/order-utils";
import type { ItemType } from "@ordersync/types";
import type { CartItem } from "@/rtk/slices/cartSlice";

type SelectedMenuItems = Array<ItemType & { quantity: number }>;

const useMenu = () => {
  const menuItemsSelector = useAppSelector((state) => state.menu.items);
  const cartSelector = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.user);
  const resId = useAppSelector((state) => state.cart.restaurant);

  const total = (
    menuItemsArg?: ItemType[],
    cartArg?: CartItem[],
    selectedMenuItemsArg?: SelectedMenuItems
  ) => {
    const menuItems = menuItemsArg || menuItemsSelector || [];
    const cart = cartArg || cartSelector || [];

    const selectedMenuItems: SelectedMenuItems =
      selectedMenuItemsArg ||
      cart?.map((cartItem) => {
        const matchedItem = menuItems?.find(
          (menuItem) => menuItem?.id === cartItem?.id
        );
        if (matchedItem) return { ...matchedItem, quantity: cartItem.quantity };
        return null;
      })?.filter(Boolean) as SelectedMenuItems;

    const price = selectedMenuItems?.reduce(
      (acc, item) => {
        const discountedPrice = priceAfterDiscount(
          item?.price,
          item?.discount,
          user,
          resId
        ).finalPrice;
        return {
          total: acc.total + item.price * item.quantity,
          discount: acc.discount + discountedPrice * item.quantity,
        };
      },
      { total: 0, discount: 0 }
    );

    return { items: selectedMenuItems, price };
  };

  return total;
};

export default useMenu;
