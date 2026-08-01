"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import MenuPopup from "@/components/RestaurantMenu/MenuPopup";
import {
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
  setShowResPausedPopup,
} from "@/rtk/slices/toggleSlice";
import { clearCart } from "@/rtk/slices/cartSlice";

const MenuPopups = () => {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const showItemsAlreadyInCartPopup = useAppSelector(
    (state) => state.toggle.showItemsAlreadyInCartPopup
  );
  const showTrackedOrderLockPopup = useAppSelector(
    (state) => state.toggle.showTrackedOrderLockPopup
  );
  const showResClosedPopup = useAppSelector(
    (state) => state.toggle.showResClosedPopup
  );
  const showResPausedPopup = useAppSelector(
    (state) => state.toggle.showResPausedPopup
  );

  const handleClearCart = () => {
    dispatch(clearCart());
    dispatch(setShowItemsAlreadyInCartPopup(false));
    dispatch(setShowTrackedOrderLockPopup(false));
    toast.success(t("Cart is cleared Successfully"), {
      position: "top-center",
      duration: 1500,
    });
  };

  return (
    <>
      <MenuPopup
        title={t("Items already in cart")}
        description={t(
          "Your cart contains items from other restaurant. Would you like to reset your cart for adding items from this restaurant?"
        )}
        visibility={showItemsAlreadyInCartPopup}
        closeCallback={() => dispatch(setShowItemsAlreadyInCartPopup(false))}
        callbackFunc={handleClearCart}
        noLabel={t("NO")}
        yesLabel={t("YES, START AFRESH")}
      />

      <MenuPopup
        title={t("Order already in delivery")}
        description={t(
          "You cannot clear these items because your order from this restaurant is already placed and being delivered to you."
        )}
        visibility={showTrackedOrderLockPopup}
        closeCallback={() => dispatch(setShowTrackedOrderLockPopup(false))}
        noLabel={t("Close")}
        yesLabel={null}
      />

      <MenuPopup
        title={t("Restaurant Is Closed")}
        description={t(
          "This restaurant is currently closed or outside of working hours. Please check back during our regular hours. We appreciate your understanding."
        )}
        visibility={showResClosedPopup}
        closeCallback={() => dispatch(setShowResClosedPopup(false))}
        callbackFunc={() => router.push("/")}
        noLabel={t("Close")}
        yesLabel={t("All Restaurants")}
      />

      <MenuPopup
        title={t("Restaurant Is Paused")}
        description={t(
          "This restaurant is temporarily paused, so we can't take any orders at the moment. We apologize for the inconvenience."
        )}
        visibility={showResPausedPopup}
        closeCallback={() => dispatch(setShowResPausedPopup(false))}
        callbackFunc={() => router.push("/")}
        noLabel={t("Close")}
        yesLabel={t("All Restaurants")}
      />
    </>
  );
};

export default MenuPopups;
