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
import { setShowOutOfRangePopup } from "@/rtk/slices/toggleSlice";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

function OutOfDeliveryRangePopup() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations();
  const isOpen = useAppSelector((state) => state.toggle.showOutOfRangePopup);

  const handleClose = () => {
    dispatch(setShowOutOfRangePopup(false));
  };

  const handleGoHome = () => {
    dispatch(setShowOutOfRangePopup(false));
    router.push("/");
  };

  return (
    <Popup
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <PopupContent>
        <PopupHeader closePopupCallback={handleClose}>
          <PopupTitle>{t("outsideDeliveryRangeTitle")}</PopupTitle>
          <PopupDescription>
            {t("outsideDeliveryRangeMessage")}
          </PopupDescription>
        </PopupHeader>

        <PopupFooter>
          <Button
            className="bg-color-2 hover:bg-color-2/90 text-white h-10 px-6"
            onClick={handleGoHome}
          >
            {t("Back To Home")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default OutOfDeliveryRangePopup;
