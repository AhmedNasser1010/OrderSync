"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  BikeIcon,
  ChevronRight,
  Clock,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import useRestaurantMenu from "@/hooks/useRestaurantMenu";
import usePlace from "@/hooks/usePlace";
import {
  quantityHandle,
  removeFromCart,
  clearCart,
} from "@/rtk/slices/cartSlice";
import { addCheckout } from "@/rtk/slices/checkoutSlice";
import { toggleOrderSidebar } from "@/rtk/slices/toggleSlice";
import { priceAfterDiscount, resolveItemDiscount, applyOrderDiscounts, calculateDiscountAmount } from "@ordersync/order-utils";
import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";
import getDeliveryFees from "@/utils/getDeliveryFees";
import isRestaurantAvailable from "@/utils/isRestaurantAvailable";
import CartEmptyState from "@/components/Cart/CartEmptyState";
import CartItemCard from "@/components/Cart/CartItemCard";
import BillDetails from "@/components/Cart/BillDetails";
import PaymentMethod from "@/components/Cart/PaymentMethod";
import type { ItemType } from "@ordersync/types";
import type { RestaurantDocument } from "@/types/restaurant";

type SelectedItem = ItemType & { quantity: number; selectedSize?: string | null };

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartRestaurantID = useAppSelector((state) => state.cart.restaurant);
  const menuItems = useAppSelector((state) => state.menu.items);
  const categories = useAppSelector((state) => state.menu.categories);
  const orderDiscounts = useAppSelector(
    (state) => state.menu.orderDiscounts || []
  );
  const restaurants = useAppSelector((state) => state.restaurants);
  const services = useAppSelector((state) => state.services);
  const user = useAppSelector((state) => state.user);
  const trackedOrder = user.trackedOrder || {
    id: null,
    restaurant: null,
    driverId: null,
  };
  const [comment, setComment] = useState("");
  const { placeOrder } = usePlace();

  useRestaurants();
  useRestaurantMenu(cart.restaurant);

  useEffect(() => {
    dispatch(
      addCheckout({
        user: {
          name: user?.userInfo?.name || null,
          phone: user?.userInfo?.phone || null,
          secondPhone: user?.userInfo?.secondPhone || null,
        },
        location: {
          latlng: user?.locations?.home?.latlng || [null, null],
          address: user?.locations?.home?.address || "",
        },
        cart: cartItems,
      })
    );
  }, [user, cartItems, dispatch]);

  const resInfo = useMemo(
    () =>
      restaurants?.filter(
        (restaurant: RestaurantDocument) =>
          restaurant.accessToken === cartRestaurantID
      )[0],
    [restaurants, cartRestaurantID]
  );

  const selectedItems = useMemo<SelectedItem[]>(
    () =>
      (cartItems ?? [])
        .map((cartItem): SelectedItem | null => {
          const menuItem = menuItems?.find(
            (menuItem) => menuItem.id === cartItem.id
          );
          if (menuItem) {
            return {
              ...menuItem,
              quantity: cartItem.quantity,
              selectedSize: cartItem?.selectedSize || null,
            };
          }
          return null;
        })
        .filter((item): item is SelectedItem => item !== null),
    [cartItems, menuItems]
  );

  const deliveryFees = useMemo(() => {
    if (!user?.locations?.selected) return 0;
    const selectedLocation = (
      user.locations as unknown as Record<string, { latlng?: number[] }>
    )[user.locations.selected];
    if (!selectedLocation?.latlng?.[0] && !selectedLocation?.latlng?.[1]) {
      return 0;
    }
    if (resInfo && user.locations) {
      const userDistanceFromRes = getDistanceFromLatlngInKm(
        selectedLocation.latlng as [number, number],
        resInfo.profile.latlng
      );
      return getDeliveryFees(userDistanceFromRes, {
        perKm: services.deliveryFees,
        min: services.minDeliveryFees,
      });
    }
    return 0;
  }, [resInfo, user, services.deliveryFees, services.minDeliveryFees]);

  const autoOrderDiscount = useMemo(() => {
    if (!selectedItems?.length || !orderDiscounts?.length) return null;
    const eligible = applyOrderDiscounts(
      selectedItems,
      orderDiscounts,
      user,
      cartRestaurantID
    );
    return eligible[0] || null;
  }, [selectedItems, orderDiscounts, user, cartRestaurantID]);

  const cartTotalPrice = useMemo(() => {
    const result = selectedItems?.reduce(
      (accumulator, item) => {
        const sizePrice = item?.selectedSize
          ? item?.sizes?.find(
              (itemSize) => itemSize.size === item?.selectedSize
            )?.price
          : undefined;
        const price = Number(sizePrice ?? item.price);
        const category = categories?.find((cat) => cat.id === item.category);
        const effectiveDiscount = resolveItemDiscount(item, category);
        const { finalPrice, isAvailableForUser } = effectiveDiscount
          ? priceAfterDiscount(price, effectiveDiscount, user, cartRestaurantID)
          : { finalPrice: price, isAvailableForUser: false };
        const discountIncluded = isAvailableForUser && price !== finalPrice;
        if (discountIncluded) {
          return {
            total: accumulator.total + price * item.quantity,
            discount: accumulator.discount + finalPrice * item.quantity,
            autoOrderAmount: accumulator.autoOrderAmount,
          };
        }
        return {
          total: accumulator.total + price * item.quantity,
          discount: accumulator.discount + price * item.quantity,
          autoOrderAmount: accumulator.autoOrderAmount,
        };
      },
      { total: deliveryFees, discount: deliveryFees, autoOrderAmount: 0 }
    );

    if (autoOrderDiscount && result) {
      const itemSubtotal = result.discount - deliveryFees;
      const orderDiscountAmount = calculateDiscountAmount(
        itemSubtotal,
        autoOrderDiscount
      );
      result.autoOrderAmount = orderDiscountAmount;
      result.discount = Math.max(0, result.discount - orderDiscountAmount);
    }

    return result;
  }, [
    deliveryFees,
    selectedItems,
    categories,
    autoOrderDiscount,
    user,
    cartRestaurantID,
  ]);

  const totalItems = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems]
  );

  const itemTotal = cartTotalPrice
    ? round2(
        cartTotalPrice.discount - deliveryFees + cartTotalPrice.autoOrderAmount
      )
    : 0;
  const finalTotal = cartTotalPrice ? round2(cartTotalPrice.discount) : 0;
  const savings = cartTotalPrice ? round2(cartTotalPrice.total - cartTotalPrice.discount) : 0;
  const autoOrderAmount = cartTotalPrice ? round2(cartTotalPrice.autoOrderAmount) : 0;

  const getItemPriceInfo = (item: SelectedItem) => {
    const sizePrice = item?.selectedSize
      ? item?.sizes?.find(
          (itemSize) => itemSize.size === item?.selectedSize
        )?.price
      : undefined;
    const price = Number(sizePrice ?? item.price);
    const category = categories?.find((cat) => cat.id === item.category);
    const effectiveDiscount = resolveItemDiscount(item, category);
    const { finalPrice, isAvailableForUser } = effectiveDiscount
      ? priceAfterDiscount(
          price,
          effectiveDiscount,
          user,
          resInfo?.accessToken || cartRestaurantID
        )
      : { finalPrice: price, isAvailableForUser: false };
    const discountIncluded = isAvailableForUser && price !== finalPrice;
    return {
      price,
      finalPrice: discountIncluded ? finalPrice : price,
      discountIncluded,
      discountMsg: discountIncluded ? effectiveDiscount?.message ?? null : null,
    };
  };

  const handleIncreaseQty = (item: SelectedItem) => {
    if (!trackedOrder.id) {
      dispatch(
        quantityHandle({
          id: item.id,
          quantity: "+",
          selectedSize: item?.selectedSize,
        })
      );
    }
  };

  const handleDecreaseQty = (item: SelectedItem) => {
    if (!trackedOrder.id) {
      dispatch(
        quantityHandle({
          id: item.id,
          quantity: "-",
          selectedSize: item?.selectedSize,
        })
      );
    }
  };

  const handleRemoveItem = (item: SelectedItem) => {
    if (!trackedOrder.id) {
      dispatch(
        removeFromCart({
          id: item.id,
          selectedSize: item?.selectedSize,
        })
      );
    }
  };

  const handleClearAll = () => {
    if (!trackedOrder.id) {
      dispatch(clearCart());
      toast.success(t("Cart is cleared Successfully"), {
        position: "top-center",
        duration: 1500,
      });
    }
  };

  const handleComment = (value: string) => {
    if (!trackedOrder.id) {
      setComment(value);
      dispatch(
        addCheckout({
          comment: value,
        })
      );
    }
  };

  if (cartItems.length === 0) {
    return <CartEmptyState />;
  }

  const resSlug = resInfo?.profile?.name?.split(" ").join("-");
  const cookTime = resInfo?.operations?.cookTime;
  const resName = locale === "ar" ? resInfo?.profile?.nameInAr : resInfo?.profile?.name;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-40 pt-6 sm:px-6 lg:pt-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label={t("Back")}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-color-7 bg-card text-color-6 transition-colors hover:bg-color-7/40"
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="font-Beiruti text-3xl leading-none text-color-1 sm:text-4xl">
              {t("Cart")}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-ProximaNovaThin text-color-8">
              <ShoppingCart className="size-3.5" />
              {totalItems} {t("Items")}
            </p>
          </div>
        </div>

        {!trackedOrder.id && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-ProximaNovaSemiBold text-red-500 transition-colors hover:bg-red-100 cursor-pointer"
          >
            <Trash2 className="size-4" />
            {t("Clear All")}
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {resInfo && (
            <div className="flex items-center gap-4 rounded-2xl border border-color-7 bg-card p-4">
              <Image
                src={resInfo?.branding?.cover || "/assets/restaurant-default-cover.jpg"}
                alt={resName || "restaurant"}
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-xl object-cover"
                style={{
                  filter: isRestaurantAvailable({
                    status: resInfo?.status,
                    openingHours: resInfo?.operations?.openingHours,
                    openNowUntil: resInfo?.operations?.openNowUntil,
                  })
                    ? "grayscale(0)"
                    : "grayscale(1)",
                }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1.5 truncate font-ProximaNovaBold text-lg text-color-1">
                  <Store className="size-4 shrink-0 text-color-2" />
                  <span className="truncate">{resName}</span>
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-ProximaNovaThin text-color-8">
                  <Clock className="size-3.5 shrink-0" />
                  {cookTime
                    ? `${cookTime[0]}-${cookTime[1]} ${t("min")}`
                    : t("El-Ayat")}
                </p>
              </div>
              {resSlug && (
                <Link
                  href={`/${resSlug}`}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-color-7/60 px-4 py-2 text-sm font-ProximaNovaSemiBold text-color-6 transition-colors hover:bg-color-7"
                >
                  {t("Menu")}
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </Link>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-color-7 bg-card px-4 sm:px-6">
            {selectedItems?.map((item) => {
              const info = getItemPriceInfo(item);
              return (
                <div
                  key={item?.id + item?.selectedSize}
                  className="border-b border-dashed border-color-7 last:border-none"
                >
                  <CartItemCard
                    item={item}
                    price={info.price}
                    finalPrice={info.finalPrice}
                    discountIncluded={info.discountIncluded}
                    discountMsg={info.discountMsg}
                    disabled={Boolean(trackedOrder.id)}
                    onIncrease={() => handleIncreaseQty(item)}
                    onDecrease={() => handleDecreaseQty(item)}
                    onRemove={() => handleRemoveItem(item)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PaymentMethod />
          <BillDetails
            itemTotal={itemTotal}
            deliveryFees={round2(deliveryFees)}
            orderDiscount={
              autoOrderDiscount
                ? {
                    message: autoOrderDiscount.message,
                    code: autoOrderDiscount.code,
                  }
                : null
            }
            orderDiscountAmount={autoOrderAmount}
            total={finalTotal}
            savings={savings}
            orderNumber={user?.trackedOrder?.orderNumber}
            comment={comment}
            disabled={Boolean(trackedOrder.id)}
            onCommentChange={handleComment}
          >
            {trackedOrder.id ? (
              <button
                type="button"
                onClick={() => dispatch(toggleOrderSidebar())}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-color-11 py-3.5 font-ProximaNovaSemiBold text-white transition-colors hover:bg-color-11/90 cursor-pointer"
              >
                <BikeIcon className="size-5" />
                {t("Order Track")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => placeOrder(comment).catch(() => {})}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-color-2 py-3.5 font-ProximaNovaSemiBold text-base text-white shadow-lg shadow-color-2/30 transition-all hover:bg-color-2/90 hover:shadow-color-2/40 cursor-pointer"
              >
                <ShoppingCart className="size-5" />
                {t("Place Order")}
              </button>
            )}
          </BillDetails>
        </aside>
      </div>

      {trackedOrder.id ? (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
          <button
            type="button"
            onClick={() => dispatch(toggleOrderSidebar())}
            className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 rounded-full bg-color-11 p-4 font-ProximaNovaSemiBold text-white shadow-2xl shadow-color-11/30 cursor-pointer"
          >
            <BikeIcon className="size-5" />
            {t("Order Track")}
          </button>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-full bg-[#282c3f] p-2 ps-5 text-white shadow-2xl shadow-black/40">
            <span className="flex flex-col">
              <span className="font-ProximaNovaThin text-xs text-white/70">
                {t("Total Price")}
              </span>
              <span className="egp font-ProximaNovaBold text-lg">
                {finalTotal}
              </span>
            </span>
            <button
              type="button"
              onClick={() => placeOrder(comment).catch(() => {})}
              className="flex items-center gap-1.5 rounded-full bg-color-2 px-6 py-3 font-ProximaNovaSemiBold text-sm text-white transition-colors hover:bg-color-2/90 cursor-pointer"
            >
              {t("Place Order")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
