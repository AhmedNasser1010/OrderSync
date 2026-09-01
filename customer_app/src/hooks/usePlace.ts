"use client";

import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  toggleLoginSidebar,
  toggleOrderSidebar,
  setShowRestaurantUnavailablePopup,
  setShowOutOfRangePopup,
  setShowOrderPlacementErrorDialog,
  setShowOrderPlacementLoading,
  setShowOrderPlacementSuccess,
} from "@/rtk/slices/toggleSlice";
import filterObject from "@/utils/filterObject";
import getUserSource from "@/utils/getUserSource";
import workingDaysChecker from "@/utils/workingDaysChecker";
import {
  priceAfterDiscount,
  resolveItemDiscount,
  applyOrderDiscounts,
  calculateDiscountAmount,
  calculateOrderFinance,
  DEFAULT_COMMISSION_PERCENT,
} from "@ordersync/order-utils";
import getDeliveryFees from "@/utils/getDeliveryFees";
import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";
import orderYupSchema from "@/lib/orderYupSchema";
import { placeOrderServer } from "@/app/actions/placeOrder";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { PlaceOrderInput } from "@/lib/orderTypes";
import type { InferType } from "yup";
import type { CartItem } from "@/rtk/slices/cartSlice";
import type { UserLocation } from "@/rtk/slices/userSlice";
import type {
  ItemType,
  DiscountObject,
} from "@ordersync/types";

type FilteredCartItem = CartItem & { discount?: { code?: string } };

const isValidCommissionPercent = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100;

type Totals = {
  total: number;
  discount: number;
  appliedOrderDiscount: DiscountObject | null;
};

const usePlace = () => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const { isAuthenticated, getIdToken } = useAuthSession();
  // In-flight guard: prevents a second order from being submitted while a
  // previous submission is still running. Survives re-renders, so even a
  // rapidly re-rendered button cannot double-fire.
  const placeInFlightRef = useRef(false);

  const user = useAppSelector((state) => state.user);
  const cart = useAppSelector((state) => state.cart);
  const accessToken = cart.restaurant;
  const menuItems = useAppSelector((state) => state.menu.items);
  const categories = useAppSelector((state) => state.menu.categories);
  const restaurants = useAppSelector((state) => state.restaurants);
  const services = useAppSelector((state) => state.services);
  const orderDiscounts = useAppSelector(
    (state) => state.menu.orderDiscounts || []
  );
  const checkout = useAppSelector((state) => state.checkout);
  const wallet = useAppSelector((state) => state.wallet);
  const cartTotal = useAppSelector((state) => state.cart);
  const currentRes = restaurants?.find(
    (restaurant) => restaurant.accessToken === cart.restaurant
  );
  const getSelectedLocation = (): UserLocation | undefined => {
    if (!user?.locations?.selected) return undefined;
    return (user.locations as unknown as Record<string, UserLocation>)[
      user.locations.selected
    ];
  };
  const userDistanceFromRes =
    getSelectedLocation()?.latlng && currentRes?.profile?.latlng
      ? getDistanceFromLatlngInKm(
          getSelectedLocation()!.latlng!,
          currentRes.profile.latlng
        )
      : undefined;
  const deliveryFees = getDeliveryFees(userDistanceFromRes, {
    perKm: services.deliveryFees,
    min: services.minDeliveryFees,
  });

  const showError = (message: string, sidebar: "login" | "order" = "login") => {
    toast.error(t(message), {
      position: "top-center",
      duration: 4000,
    });
    if (sidebar === "login") {
      dispatch(toggleLoginSidebar());
    } else {
      dispatch(toggleOrderSidebar());
    }
  };

  const checkIfUserIsLoggedIn = () => {
    if (isAuthenticated) return true;
    showError("loginAndUpdateContactFirst");
    return false;
  };

  const checkUserInformation = () => {
    if (user?.userInfo?.name && user?.userInfo?.phone) return true;
    showError("Update user information first");
    return false;
  };

  const checkIfUserHasLocation = () => {
    const selectedLocation = getSelectedLocation();
    if (
      selectedLocation?.address &&
      selectedLocation?.latlng?.[0] &&
      selectedLocation?.latlng?.[1]
    ) {
      return true;
    }
    showError("Error update your location address first");
    return false;
  };

  const checkIfUserHasCart = () => {
    return cart?.items?.length > 0 || showError("Your cart is empty");
  };

  const checkIfUserHasNoOrder = () => {
    if (!user?.trackedOrder?.id) return true;
    showError("You already have an order in progress", "order");
    return false;
  };

  const checkIfUserIsActive = () => {
    if (user?.isActive === false) {
      showError("accountSuspendedMessage");
      return false;
    }
    return true;
  };

  const checkIfRestaurantIsOpen = () => {
    if (
      workingDaysChecker(
        currentRes?.operations?.openingHours,
        undefined,
        currentRes?.operations?.openNowUntil
      ) === false
    ) {
      dispatch(setShowRestaurantUnavailablePopup(true));
      return false;
    }
    return true;
  };

  const checkIfRestaurantHasCommission = () => {
    if (isValidCommissionPercent(currentRes?.commissionPercent)) return true;
    showError("restaurantCannotReceiveOrders", "order");
    return false;
  };

  const getCartFromMenu = () => {
    return cart.items
      .map((cartItem) => {
        const menuItem = menuItems?.find(
          (menuItem) => menuItem.id === cartItem.id
        );
        if (menuItem) {
          return {
            ...menuItem,
            ...cartItem,
          };
        }
        return null;
      })
      .filter((item): item is ItemType & CartItem => item !== null);
  };

  const getCartTotalPrice = () => {
    const selectedItems = getCartFromMenu();
    const result = selectedItems?.reduce<Totals>(
      (accumulator, item) => {
        const price = item?.selectedSize
          ? Number(
              item.sizes?.find(
                (itemSize) => itemSize.size === item.selectedSize
              )?.price ?? item.price
            )
          : item.price;
        const category = categories?.find((cat) => cat.id === item.category);
        const effectiveDiscount = resolveItemDiscount(item, category);
        const { finalPrice, isAvailableForUser } = effectiveDiscount
          ? priceAfterDiscount(price, effectiveDiscount, user, accessToken)
          : { finalPrice: price, isAvailableForUser: false };
        const discountIncluded = isAvailableForUser && price !== finalPrice;
        if (discountIncluded) {
          return {
            total: accumulator.total + price * item.quantity,
            discount: accumulator.discount + finalPrice * item.quantity,
            appliedOrderDiscount: accumulator.appliedOrderDiscount,
          };
        } else {
          return {
            total: accumulator.total + price * item.quantity,
            discount: accumulator.discount + price * item.quantity,
            appliedOrderDiscount: accumulator.appliedOrderDiscount,
          };
        }
      },
      { total: deliveryFees, discount: deliveryFees, appliedOrderDiscount: null }
    );

    if (result) {
      const eligibleDiscounts = applyOrderDiscounts(
        selectedItems,
        orderDiscounts,
        user,
        accessToken
      );
      const autoDiscount = eligibleDiscounts[0] || null;

      if (autoDiscount) {
        const itemSubtotal = result.discount - deliveryFees;
        const orderDiscountAmount = calculateDiscountAmount(
          itemSubtotal,
          autoDiscount
        );
        result.discount = Math.max(0, result.discount - orderDiscountAmount);
      }

      result.appliedOrderDiscount = autoDiscount;
    }

    return result;
  };

  const orderDataFinalize = (comment?: string) => {
    const currentResLoyaltyData = user?.restaurants?.find(
      (res) => res.accessToken === accessToken
    );
    const orderSource = getUserSource();
    const filteredCart = cart.items.map((obj) =>
      filterObject(
        obj as unknown as Record<string, unknown>,
        ["discount"],
        true
      )
    ) as unknown as FilteredCartItem[];
    const cartTotalPrice = getCartTotalPrice();
    const selectedLocation = getSelectedLocation();
    const autoDiscount = cartTotalPrice?.appliedOrderDiscount;

    const subtotal = cartTotalPrice.total - deliveryFees;
    const discount = cartTotalPrice.total - cartTotalPrice.discount;
    const baseTotal = cartTotalPrice.discount;

    // Wallet redemption: how much the customer wants to apply, clamped to the
    // available balance and to the current cart total. The server re-validates
    // and re-computes this authoritatively.
    const useWallet = checkout?.useWallet === true;
    const requestedWallet = Number(checkout?.walletRedeemed ?? 0);
    const walletRedeemed =
      useWallet && wallet?.balance > 0
        ? Math.max(
            0,
            Math.min(Math.floor(requestedWallet || wallet.balance), baseTotal)
          )
        : 0;

    return {
      customerUid: user.uid as string,
      business: {
        id: currentRes?.accessToken || "",
        name: currentRes?.profile.name || "",
        nameInAr: currentRes?.profile.nameInAr || "",
        phone: currentRes?.owner.phone || "",
        address: currentRes?.profile.address || "",
        latlng: currentRes?.profile.latlng || ([0, 0] as [number, number]),
      },
      assignment: { driverUid: null },
      delivery: {
        address: selectedLocation?.address || "",
        latlng: selectedLocation?.latlng || [],
        note: comment || undefined,
      },
      cart: filteredCart.map((item: FilteredCartItem) => {
        const menuItem = menuItems?.find((mi) => mi.id === item.id);
        return {
          id: item.id,
          name: menuItem?.title || "",
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          discountCode: item.discount?.code || undefined,
        };
      }),
      pricing: {
        subtotal,
        discount,
        deliveryFees,
        total: baseTotal,
        ...(autoDiscount && {
          promoCode: autoDiscount.code,
          promoDiscount: calculateDiscountAmount(subtotal, autoDiscount),
        }),
        walletRedeemed: walletRedeemed > 0 ? walletRedeemed : undefined,
      },
      payment: {
        method: "CASH",
        status: "COMPLETED",
      },
      finance: calculateOrderFinance({
        subtotal,
        discount,
        deliveryFees,
        total: baseTotal,
        commissionPercent:
          currentRes?.commissionPercent ?? DEFAULT_COMMISSION_PERCENT,
      }),
      notes: { order: comment || undefined },
      metadata: {
        orderSource,
      },
      customer: {
        uid: user.uid as string,
        name: user.userInfo?.name as string,
        phone: user.userInfo?.phone as string,
        secondPhone: user.userInfo?.secondPhone,
        firstOrderDate: currentResLoyaltyData?.firstOrderTime || Date.now(),
        totalOrders: currentResLoyaltyData?.totalOrders || 1,
        totalOrdersValue:
          currentResLoyaltyData?.totalAmount || cartTotalPrice.discount,
      },
    };
  };

  const validateOrderData = (comment?: string) => {
    return orderYupSchema.validate(orderDataFinalize(comment), {
      abortEarly: false,
    });
  };

  const placeOrderMutation = async (
    validatedData: InferType<typeof orderYupSchema>
  ) => {
    const idToken = await getIdToken();
    if (!idToken) {
      throw { code: "UNAUTHORIZED" };
    }
    const result = await placeOrderServer({
      idToken,
      orderData: validatedData as unknown as PlaceOrderInput,
    });
    if (!result.success) {
      throw { code: result.code };
    }
    return result;
  };

  const handleOrderPlacementSuccess = () => {
    dispatch(setShowOrderPlacementLoading(false));
    dispatch(setShowOrderPlacementSuccess(true));
  };

  const handleOrderPlacementError = (err: unknown) => {
    dispatch(setShowOrderPlacementLoading(false));
    const error = err as { code?: string; data?: { code?: string } };
    if (
      error?.code === "RESTAURANT_NOT_ACCEPTING_ORDERS" ||
      error?.data?.code === "RESTAURANT_NOT_ACCEPTING_ORDERS"
    ) {
      dispatch(setShowRestaurantUnavailablePopup(true));
      return;
    }

    if (
      error?.code === "ALREADY_HAS_ACTIVE_ORDER" ||
      error?.data?.code === "ALREADY_HAS_ACTIVE_ORDER"
    ) {
      toast.error(t("You already have an order in progress"), {
        position: "top-center",
        duration: 4000,
      });
      dispatch(toggleOrderSidebar());
      return;
    }

    if (
      error?.code === "RESTAURANT_COMMISSION_NOT_SET" ||
      error?.data?.code === "RESTAURANT_COMMISSION_NOT_SET"
    ) {
      toast.error(t("restaurantCannotReceiveOrders"), {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (
      error?.code === "OUT_OF_DELIVERY_RANGE" ||
      error?.data?.code === "OUT_OF_DELIVERY_RANGE"
    ) {
      dispatch(setShowOutOfRangePopup(true));
      return;
    }

    if (
      error?.code === "PRICE_MISMATCH" ||
      error?.data?.code === "PRICE_MISMATCH"
    ) {
      dispatch(setShowOrderPlacementErrorDialog(true));
      return;
    }

    toast.error(t("Error placing order"), {
      position: "top-center",
      duration: 4000,
    });
    console.error(err);
  };

  const placeOrder = (comment?: string) => {
    return new Promise((resolve, reject) => {
      // Drop duplicate submissions (double-click / rapid re-render) while a
      // previous placement is still running.
      if (placeInFlightRef.current) {
        resolve(false);
        return;
      }
      placeInFlightRef.current = true;

      const release = () => {
        placeInFlightRef.current = false;
      };

      if (
        checkIfUserIsLoggedIn() &&
        checkIfUserIsActive() &&
        checkIfRestaurantIsOpen() &&
        checkIfRestaurantHasCommission() &&
        checkUserInformation() &&
        checkIfUserHasLocation() &&
        checkIfUserHasCart() &&
        checkIfUserHasNoOrder()
      ) {
        dispatch(setShowOrderPlacementLoading(true));
        validateOrderData(comment)
          .then((validatedData) => {
            placeOrderMutation(validatedData)
              .then(() => {
                handleOrderPlacementSuccess();
                release();
                resolve(true);
              })
              .catch((err) => {
                handleOrderPlacementError(err);
                release();
                reject(err);
              });
          })
          .catch((err) => {
            handleOrderPlacementError(err);
            release();
            reject(err);
          });
      } else {
        release();
        resolve(false);
      }
    });
  };

  return {
    placeOrder,
  };
};

export default usePlace;
