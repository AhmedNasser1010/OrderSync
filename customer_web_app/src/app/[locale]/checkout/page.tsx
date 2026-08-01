"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAppSelector } from "@/rtk/hooks";
import workingDaysChecker from "@/utils/workingDaysChecker";
import getDeliveryFees from "@/utils/getDeliveryFees";
import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";
import useRestaurants from "@/hooks/useRestaurants";
import useRestaurantMenu from "@/hooks/useRestaurantMenu";
import CheckPoints from "@/components/Checkout/CheckPoints";
import CheckoutUserInfoForm from "@/components/Checkout/CheckoutUserInfoForm";
import CheckoutUserAddress from "@/components/Checkout/CheckoutUserAddress";
import CheckoutUserPayment from "@/components/Checkout/CheckoutUserPayment";
import PopupMsg from "@/components/Checkout/PopupMsg";

export default function CheckoutPage() {
  const t = useTranslations();
  const cart = useAppSelector((state) => state.cart);
  const cartItems = cart.items;
  const restaurants = useAppSelector((state) => state.restaurants);
  const services = useAppSelector((state) => state.services);
  const user = useAppSelector((state) => state.user);

  useRestaurants();
  useRestaurantMenu(cart.restaurant);

  const [currentState, setCurrentState] = useState<string>(
    cartItems?.length ? "ON_USER_INFO" : "CART_IS_EMPTY"
  );

  const res = useMemo(
    () =>
      restaurants?.find(
        (restaurant) => restaurant.accessToken === cart.restaurant
      ),
    [restaurants, cart.restaurant]
  );

  const isAvailable = useMemo(
    () => workingDaysChecker(res?.operations?.openingHours),
    [res]
  );

  const deliveryFees = useMemo(() => {
    if (!res || !user?.locations?.selected) return 0;
    const selectedLocation = (
      user.locations as unknown as Record<string, { latlng?: number[] }>
    )[user.locations.selected];
    if (!selectedLocation?.latlng?.[0] && !selectedLocation?.latlng?.[1]) {
      return 0;
    }
    const distance = getDistanceFromLatlngInKm(
      selectedLocation.latlng as [number, number],
      res.profile.latlng
    );
    return getDeliveryFees(distance, services.deliveryFees);
  }, [res, user, services.deliveryFees]);

  const handleCurrentState = (status: string) => {
    setCurrentState(status);
  };

  const barProgress = useMemo(() => {
    if (currentState === "ON_USER_ADDRESS") return 50;
    if (currentState === "ON_PAYMENT") return 100;
    return 0;
  }, [currentState]);

  const cartIsEmpty = !cartItems?.length;

  if (cartIsEmpty) {
    return (
      <section className="my-[100px] mx-6 md:mx-[150px]">
        <PopupMsg
          title={t("Empty Cart")}
          subject={t("Your cart is empty continue shopping and come back again")}
          button={<Link href="/">{t("Continue Shopping")}</Link>}
        />
      </section>
    );
  }

  if (!isAvailable) {
    return (
      <section className="my-[100px] mx-6 md:mx-[150px]">
        <PopupMsg
          title={t("Not Available")}
          subject={
            res?.branding?.closeMsg ||
            t("notAvailableRightNow")
          }
          button={<Link href="/">{t("Back To Home")}</Link>}
        />
      </section>
    );
  }

  return (
    <section className="my-[100px] mx-6 md:mx-[150px]">
      <div className="mb-20">
        <CheckPoints
          steps={[t("Contact"), t("Address"), t("Payment")]}
          progress={barProgress}
          themeColorFill="#60b246"
          themeColorEmpty="#eee"
        />
      </div>
      {currentState === "ON_USER_INFO" && (
        <CheckoutUserInfoForm handleCurrentState={handleCurrentState} />
      )}
      {currentState === "ON_USER_ADDRESS" && (
        <CheckoutUserAddress
          handleCurrentState={handleCurrentState}
          restaurantLocation={res?.profile?.latlng || [29.620724, 31.250945]}
        />
      )}
      {currentState === "ON_PAYMENT" && (
        <CheckoutUserPayment
          handleCurrentState={handleCurrentState}
          res={res}
          deliveryFees={deliveryFees}
        />
      )}
    </section>
  );
}
