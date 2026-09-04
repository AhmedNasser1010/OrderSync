"use client";

import FeedbackPopup from "@/components/popup_components/FeedbackPopup";
import OrderCancellationNotice from "@/components/popup_components/OrderCancellationNotice";
import RestaurantUnavailablePopup from "@/components/popup_components/RestaurantUnavailablePopup";
import OutOfDeliveryRangePopup from "@/components/popup_components/OutOfDeliveryRangePopup";
import OrderPlacementErrorDialog from "@/components/popup_components/OrderPlacementErrorDialog";
import OrderSuccessCelebration from "@/components/popup_components/OrderSuccessCelebration";
import ProfileIncompletePopup from "@/components/popup_components/ProfileIncompletePopup";

function PopupProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FeedbackPopup />
      <OrderCancellationNotice />
      <RestaurantUnavailablePopup />
      <OutOfDeliveryRangePopup />
      <OrderPlacementErrorDialog />
      <OrderSuccessCelebration />
      <ProfileIncompletePopup />
      {children}
    </>
  );
}

export default PopupProvider;
