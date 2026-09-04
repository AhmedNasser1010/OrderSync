"use client";

import { useTranslations } from "next-intl";
import { UserRoundIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { setShowProfileIncompletePopup } from "@/rtk/slices/toggleSlice";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

function ProfileIncompletePopup() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations();
  const isOpen = useAppSelector(
    (state) => state.toggle.showProfileIncompletePopup
  );

  const rememberDismissed = () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "zajil-profile-popup-dismissed",
          "1"
        );
      }
    } catch {
      // Storage unavailable; non-blocking.
    }
  };

  const handleClose = () => {
    rememberDismissed();
    dispatch(setShowProfileIncompletePopup(false));
  };

  const handleUpdate = () => {
    dispatch(setShowProfileIncompletePopup(false));
    router.push("/onboarding");
  };

  return (
    <Popup open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <PopupContent className="sm:max-w-md">
        <PopupHeader closePopupCallback={handleClose}>
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-color-2/10">
            <UserRoundIcon className="size-7 text-color-2" />
          </div>
          <PopupTitle>{t("ProfileIncompleteTitle")}</PopupTitle>
          <PopupDescription>{t("ProfileIncompleteBody")}</PopupDescription>
        </PopupHeader>

        <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-ProximaNovaMed">
            <span className="inline-flex items-center gap-1.5">
              <UserRoundIcon className="size-4" />
              {t("Name")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PhoneIcon className="size-4" />
              {t("Phone")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-4" />
              {t("Address")}
            </span>
          </span>
        </div>

        <PopupDescription className="text-center text-xs">
          {t("ProfileIncompleteHint")}
        </PopupDescription>

        <PopupFooter>
          <Button
            className="h-11 w-full bg-color-2 text-base text-white hover:bg-color-2/90"
            size="xl"
            onClick={handleUpdate}
          >
            {t("Update User Information")}
          </Button>
          <Button
            className="h-11 w-full bg-transparent text-color-6 hover:bg-color-7/40"
            size="xl"
            onClick={handleClose}
          >
            {t("ProfileIncompleteDismiss")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default ProfileIncompletePopup;
