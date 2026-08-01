"use client";

import { useEffect, useState } from "react";
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
import { setCancellationNoticeIsOpen } from "@/rtk/slices/toggleSlice";
import useOrder from "@/hooks/useOrder";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

function OrderCancellationNotice() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector(
    (state) => state.toggle.cancellationNoticeIsOpen
  );
  const { trackedOrderData } = useOrder();
  const [cancellationReason, setCancellationReason] = useState("");
  const t = useTranslations();
  const status = trackedOrderData?.status?.current;
  const noticeTitles: Record<string, string> = {
    CANCELED: "Your Order Has Been Canceled!",
    REJECTED: "Your Order Has Been Rejected!",
    VOIDED: "Your Order Has Been Voided!",
  };

  useEffect(() => {
    if (trackedOrderData?.status?.cancellationReason) {
      setCancellationReason(trackedOrderData?.status?.cancellationReason);
    }
  }, [trackedOrderData?.status?.cancellationReason]);

  const handleClick = () => {
    dispatch(setCancellationNoticeIsOpen(false));
    router.push("/");
  };

  return (
    <Popup open={isOpen} onOpenChange={(open) => !open && handleClick()}>
      <PopupContent>
        <PopupHeader closePopupCallback={handleClick}>
          <PopupTitle>
            {t(noticeTitles[status || ""] || "Your Order Has Been Canceled!")}
          </PopupTitle>
          <PopupDescription>
            {cancellationReason ||
              t("orderCancellationNotice")}
          </PopupDescription>
        </PopupHeader>

        <PopupFooter>
          <Button
            className="bg-color-2 hover:bg-color-2/90 text-white h-10 px-6"
            onClick={handleClick}
          >
            {t("Browse Other Restaurants")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default OrderCancellationNotice;
