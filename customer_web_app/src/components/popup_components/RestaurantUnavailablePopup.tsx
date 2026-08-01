"use client";

import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { clearCart } from "@/rtk/slices/cartSlice";
import { setShowRestaurantUnavailablePopup } from "@/rtk/slices/toggleSlice";
import { initRestaurants } from "@/rtk/slices/restaurantsSlice";
import DB_GET_COLLECTION from "@/utils/DB_GET_COLLECTION";
import type { BusinessDocument } from "@ordersync/types";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

function RestaurantUnavailablePopup() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations();
  const isOpen = useAppSelector(
    (state) => state.toggle.showRestaurantUnavailablePopup
  );

  const refreshRestaurants = async () => {
    const restaurants = await DB_GET_COLLECTION("businesses");
    if (Array.isArray(restaurants)) {
      dispatch(initRestaurants(restaurants as unknown as BusinessDocument[]));
    }
  };

  const handleGoHome = async () => {
    await refreshRestaurants();
    dispatch(clearCart());
    dispatch(setShowRestaurantUnavailablePopup(false));
    router.push("/");
  };

  const handleClose = async () => {
    await refreshRestaurants();
    dispatch(setShowRestaurantUnavailablePopup(false));
  };

  return (
    <Popup
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <PopupContent>
        <PopupHeader closePopupCallback={handleClose}>
          <PopupTitle>{t("Restaurant Is Closed")}</PopupTitle>
          <PopupDescription>
            {t("restaurantUnavailableMessage")}
          </PopupDescription>
        </PopupHeader>

        <PopupFooter>
          <Button
            className="bg-color-2 hover:bg-color-2/90 text-white h-10 px-6"
            onClick={handleGoHome}
          >
            {t("Remove Cart Items and Go Home")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default RestaurantUnavailablePopup;
