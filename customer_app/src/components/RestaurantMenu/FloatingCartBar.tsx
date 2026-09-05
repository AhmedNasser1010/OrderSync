"use client";

import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/rtk/hooks";
import {
  applyOrderDiscounts,
  calculateDiscountAmount,
  priceAfterDiscount,
  resolveItemDiscount,
} from "@ordersync/order-utils";

const FloatingCartBar = ({ resID }: { resID: string }) => {
  const t = useTranslations();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartRestaurantID = useAppSelector((state) => state.cart.restaurant);
  const menuItems = useAppSelector((state) => state.menu.items);
  const categories = useAppSelector((state) => state.menu.categories);
  const orderDiscounts = useAppSelector(
    (state) => state.menu.orderDiscounts || [],
  );
  const user = useAppSelector((state) => state.user);

  const isVisible = cartItems.length > 0 && cartRestaurantID === resID;

  const subtotal = useMemo(() => {
    if (!isVisible) return 0;

    const selectedItems = cartItems.flatMap((cartItem) => {
      const menuItem = menuItems?.find((m) => m.id === cartItem.id);
      if (!menuItem) return [];
      return [
        {
          ...menuItem,
          quantity: cartItem.quantity,
          selectedSize: cartItem?.selectedSize || null,
        },
      ];
    });

    const result = selectedItems.reduce(
      (acc, item) => {
        const sizePrice = item?.selectedSize
          ? item?.sizes?.find((s) => s.size === item.selectedSize)?.price
          : undefined;
        const price = Number(sizePrice ?? item.price);
        const category = categories?.find((c) => c.id === item.category);
        const effectiveDiscount = resolveItemDiscount(item, category);
        const { finalPrice, isAvailableForUser } = effectiveDiscount
          ? priceAfterDiscount(price, effectiveDiscount, user, resID)
          : { finalPrice: price, isAvailableForUser: false };
        const discountIncluded = isAvailableForUser && price !== finalPrice;
        return {
          total: acc.total + price * item.quantity,
          discount:
            acc.discount +
            (discountIncluded ? finalPrice : price) * item.quantity,
        };
      },
      { total: 0, discount: 0 },
    );

    if (orderDiscounts?.length) {
      const eligible = applyOrderDiscounts(
        selectedItems,
        orderDiscounts,
        user,
        resID,
      );
      const autoOrderDiscount = eligible[0] || null;
      if (autoOrderDiscount && result.total > 0) {
        const orderDiscountAmount = calculateDiscountAmount(
          result.discount,
          autoOrderDiscount,
        );
        result.discount = Math.max(0, result.discount - orderDiscountAmount);
      }
    }

    return Math.round(result.discount * 100) / 100;
  }, [
    cartItems,
    isVisible,
    menuItems,
    categories,
    orderDiscounts,
    user,
    resID,
  ]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-22 lg:bottom-4 inset-x-0 z-40 px-4">
      <Link
        href="/cart"
        className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 rounded-full bg-[#282c3f] py-3 pe-3 ps-5 text-white shadow-2xl shadow-black/40 transition-transform hover:scale-[1.02]"
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <ShoppingCart className="size-6 text-color-2" />
            <span className="absolute -top-2 -end-2 grid min-w-4.5 min-h-4.5 place-items-center rounded-full bg-color-2 px-1 text-[10px] font-ProximaNovaBold text-white">
              {totalItems}
            </span>
          </span>
          <span className="flex flex-col">
            <span className="font-ProximaNovaSemiBold text-sm">
              {totalItems} {t("Items")}
            </span>
            <span className="egp font-ProximaNovaMed text-sm text-white/70">
              {subtotal}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-color-2 px-5 py-2 font-ProximaNovaSemiBold text-sm text-white">
          {t("View Cart")}
        </span>
      </Link>
    </div>
  );
};

export default FloatingCartBar;
