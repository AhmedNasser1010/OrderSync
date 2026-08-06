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
import { setShowOrderPlacementErrorDialog } from "@/rtk/slices/toggleSlice";
import { Button } from "@/components/ui/button";

function OrderPlacementErrorDialog() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const isOpen = useAppSelector(
    (state) => state.toggle.showOrderPlacementErrorDialog
  );

  const handleReload = () => {
    dispatch(setShowOrderPlacementErrorDialog(false));
    window.location.reload();
  };

  return (
    <Popup
      open={isOpen}
      onOpenChange={(open) => !open && dispatch(setShowOrderPlacementErrorDialog(false))}
    >
      <PopupContent>
        <PopupHeader closePopupCallback={() => dispatch(setShowOrderPlacementErrorDialog(false))}>
          <PopupTitle>{t("Something Went Wrong")}</PopupTitle>
          <PopupDescription>
            {t("orderPlacementErrorMessage")}
          </PopupDescription>
        </PopupHeader>

        <PopupFooter>
          <Button
            className="bg-color-2 hover:bg-color-2/90 text-white h-10 px-6"
            onClick={handleReload}
          >
            {t("Try Again")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default OrderPlacementErrorDialog;
