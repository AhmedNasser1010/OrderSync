"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import useRestaurants from "@/hooks/useRestaurants";
import useRestaurantMenu from "@/hooks/useRestaurantMenu";
import usePlace from "@/hooks/usePlace";
import {
  quantityHandle,
  clearCart,
} from "@/rtk/slices/cartSlice";
import { addCheckout } from "@/rtk/slices/checkoutSlice";
import { toggleOrderSidebar } from "@/rtk/slices/toggleSlice";
import { priceAfterDiscount, resolveItemDiscount, applyOrderDiscounts } from "@ordersync/order-utils";
import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";
import getDeliveryFees from "@/utils/getDeliveryFees";
import OrderInfo from "@/components/Cart/OrderInfo";
import ItemAvailability from "@/components/RestaurantMenu/ItemAvailability";
import ItemTitle from "@/components/RestaurantMenu/ItemTitle";
import DiscountMsg from "@/components/RestaurantMenu/DiscountMsg";
import ItemPrice from "@/components/RestaurantMenu/ItemPrice";
import ItemDescription from "@/components/RestaurantMenu/ItemDescription";
import ItemSizesBar from "@/components/RestaurantMenu/ItemSizesBar";
import type { ItemType } from "@ordersync/types";
import type { RestaurantDocument } from "@/types/restaurant";

type SelectedItem = ItemType & { quantity: number; selectedSize?: string | null };

export default function CartPage() {
  const t = useTranslations();
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
      return getDeliveryFees(userDistanceFromRes, services.deliveryFees);
    }
    return 0;
  }, [resInfo, user, services.deliveryFees]);

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
          };
        }
        return {
          total: accumulator.total + price * item.quantity,
          discount: accumulator.discount + price * item.quantity,
        };
      },
      { total: deliveryFees, discount: deliveryFees }
    );

    if (autoOrderDiscount && result) {
      const itemSubtotal = result.discount - deliveryFees;
      const orderDiscountAmount =
        autoOrderDiscount.type === "P"
          ? itemSubtotal * (autoOrderDiscount.value / 100)
          : Math.min(autoOrderDiscount.value, itemSubtotal);
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

  const handleClearAll = () => {
    if (!trackedOrder.id) {
      dispatch(clearCart());
      toast.success(t("Cart is cleared Successfully"), {
        position: "top-center",
        duration: 1500,
      });
    }
  };

  const handleComment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!trackedOrder.id) {
      setComment(e.target.value);
      dispatch(
        addCheckout({
          comment: e.target.value,
        })
      );
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto pt-5 mb-10 md:w-1/2 min-h-screen">
        <div className="flex items-center justify-center flex-col mt-20">
          <img
            src="/assets/empty-cart.webp"
            alt="empty-cart"
            className="w-72 h-64"
          />
          <h2 className="mt-6 text-xl text-color-6 font-ProximaNovaSemiBold">
            {t("Your cart is empty")}
          </h2>
          <p className="mt-1 text-color-8 font-ProximaNovaThin text-sm">
            {t("You can go to home page to view more restaurants")}
          </p>
          <Link
            href="/"
            className="uppercase mt-7 py-3 px-5 bg-color-2 text-white font-ProximaNovaBold cursor-pointer border-0 text-[15px] text-center"
          >
            {t("see restaurants near you")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-28 mb-10 2xl:w-1/2 md:w-4/5 md:px-0 px-5">
      <div className="checkout-container">
        <div className="flex items-start justify-center gap-4 my-3">
          <div>
            <img
              src={resInfo?.branding?.cover}
              alt="res-img"
              className="w-20"
            />
          </div>
          <div className="tracking-tighter">
            <h2 className="font-ProximaNovaMed sm:text-2xl text-lg">
              {resInfo?.profile?.name}
            </h2>
            <p className="font-ProximaNovaThin sm:text-base text-sm -mt-1">
              {t("El-Ayat")}
            </p>
          </div>
        </div>
        {selectedItems?.map((item) => {
          const sizePrice = item?.selectedSize
            ? item?.sizes?.find(
                (itemSize) => itemSize.size === item?.selectedSize
              )?.price
            : undefined;
          const price = Number(sizePrice ?? item.price);
          const category = categories?.find((cat) => cat.id === item.category);
          const effectiveDiscount = resolveItemDiscount(item, category);
          const { finalPrice, isAvailableForUser } = effectiveDiscount
            ? priceAfterDiscount(price, effectiveDiscount, user, resInfo?.accessToken || cartRestaurantID)
            : { finalPrice: price, isAvailableForUser: false };
          const discountIncluded = isAvailableForUser && price !== finalPrice;
          return (
            <div
              key={item?.id + item?.selectedSize}
              className="item flex items-start justify-between pb-8"
            >
              <div className="md:w-auto w-3/5">
                <ItemAvailability />
                <ItemTitle title={item?.title} discountIncluded={discountIncluded} />
                <DiscountMsg
                  discountMsg={effectiveDiscount?.message}
                  discountIncluded={discountIncluded}
                />
                <ItemPrice
                  price={price}
                  finalPrice={finalPrice ?? item?.price}
                  discountIncluded={discountIncluded}
                />
                <ItemDescription description={item?.description} />
                <ItemSizesBar item={item} selectedSize={item?.selectedSize} />
              </div>
              <div className="relative w-[118px] h-24">
                {item?.backgrounds?.[0] && (
                  <button className="cursor-pointer w-[118px] h-24 rounded-md">
                    <img
                      src={item?.backgrounds[0]}
                      alt="menu-img"
                      className="rounded-md w-[118px] h-24 object-cover"
                    />
                  </button>
                )}
                <div className="absolute flex justify-around items-center text-x1 -bottom-2 left-1/2 -translate-x-1/2 z-[1] w-24 h-9 shadow-md shadow-color-7 bg-color-11 text-white text-center rounded text-sm font-ProximaNovaSemiBold uppercase">
                  <button
                    className="w-1/3 h-full"
                    onMouseUp={() => handleIncreaseQty(item)}
                  >
                    +
                  </button>
                  <span className="w-1/3">{item.quantity}</span>
                  <button
                    className="w-1/3 h-full"
                    onMouseUp={() => handleDecreaseQty(item)}
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <OrderInfo
          deliveryFees={deliveryFees}
          orderNumber={user?.trackedOrder?.orderNumber}
        />
        {cartTotalPrice.total !== cartTotalPrice.discount && (
          <>
            <div className="discount flex justify-between bg-color-11 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
              <div>
                <h3 className="font-ProximaNovaSemiBold">{t("Total Price")}</h3>
              </div>
              <div>
                <span className="egp font-ProximaNovaSemiBold">
                  {cartTotalPrice.total}
                </span>
              </div>
            </div>
            {autoOrderDiscount && (
              <div className="flex justify-between bg-green-600 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
                <div>
                  <h3 className="font-ProximaNovaSemiBold">
                    {autoOrderDiscount.message || autoOrderDiscount.code}
                  </h3>
                </div>
                <div>
                  <span className="egp font-ProximaNovaSemiBold">
                    {autoOrderDiscount.type === "P"
                      ? `-${autoOrderDiscount.value}%`
                      : `-${autoOrderDiscount.value}LE`}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between bg-color-11 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
              <div>
                <h3 className="font-ProximaNovaSemiBold">
                  {t("Total Price Discounted")}
                </h3>
              </div>
              <div>
                <span className="egp font-ProximaNovaSemiBold">
                  {cartTotalPrice.discount}
                </span>
              </div>
            </div>
          </>
        )}
        {cartTotalPrice.total === cartTotalPrice.discount && (
          <div className="flex justify-between bg-color-11 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
            <div>
              <h3 className="font-ProximaNovaSemiBold">{t("Total Price")}</h3>
            </div>
            <div>
              <span className="egp font-ProximaNovaSemiBold">
                {cartTotalPrice.total}
              </span>
            </div>
          </div>
        )}
        {!trackedOrder.id && (
          <input
            className="w-full p-3 border border-gray-300"
            id="comment"
            type="text"
            placeholder={t("Comment, extras")}
            value={comment}
            onChange={handleComment}
          />
        )}
        <div className="flex items-center justify-center gap-2 mt-2 checkout-btns">
          {trackedOrder.id && (
            <button
              onClick={() => dispatch(toggleOrderSidebar())}
              className="bg-color-11 border border-color-11 text-white hover:bg-white hover:text-color-11"
            >
              {t("Order Track")}
            </button>
          )}

          {!trackedOrder.id && (
            <>
              <button
                onClick={handleClearAll}
                className="border border-red-500 bg-red-500 text-white hover:bg-white hover:text-red-500"
              >
                {t("Clear All")}
              </button>
              <button
                onClick={() => placeOrder(comment)}
                className="bg-color-11 border border-color-11 text-white hover:bg-white hover:text-color-11"
              >
                {t("Place Order")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
