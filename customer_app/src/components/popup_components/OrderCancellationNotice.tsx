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
import {
  setCancellationNoticeIsOpen,
  setCancellationDismissedOrderId,
} from "@/rtk/slices/toggleSlice";
import useOrder from "@/hooks/useOrder";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function OrderCancellationNotice() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector(
    (state) => state.toggle.cancellationNoticeIsOpen
  );
  const { trackedOrderData } = useOrder();
  const t = useTranslations();
  const status = trackedOrderData?.status?.current;
  const cancellationReason = trackedOrderData?.status?.cancellationReason || "";
  const noticeTitles: Record<string, string> = {
    CANCELED: "Your Order Has Been Canceled!",
    REJECTED: "Your Order Has Been Rejected!",
    VOIDED: "Your Order Has Been Voided!",
  };

  const handleClick = () => {
    const orderId = trackedOrderData?.id;
    if (orderId) {
      dispatch(setCancellationDismissedOrderId(orderId));
    }
    dispatch(setCancellationNoticeIsOpen(false));
    router.push("/");
  };

  return (
    <Popup open={isOpen} onOpenChange={(open) => !open && handleClick()}>
      <PopupContent className="pt-8">
        <PopupHeader closePopupCallback={handleClick} className="pt-2">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 shrink-0 mb-1">
            <XIcon className="size-7 text-red-500" />
          </div>
          <PopupTitle>
            {t(noticeTitles[status || ""] || "Your Order Has Been Canceled!")}
          </PopupTitle>
          {cancellationReason ? (
            <div className="border border-red-200 bg-red-50 rounded-xl px-4 py-3 mt-1">
              <p className="text-[11px] uppercase tracking-wide text-red-400 font-ProximaNovaSemiBold">
                {t("Cancellation Reason")}
              </p>
              <p className="text-red-600 font-ProximaNovaSemiBold text-sm leading-relaxed mt-1">
                {cancellationReason}
              </p>
            </div>
          ) : (
            <PopupDescription>{t("orderCancellationNotice")}</PopupDescription>
          )}
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
