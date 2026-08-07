"use client";

import { useMemo, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { BikeIcon } from "lucide-react";
import {
  Popup,
  PopupContent,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  setShowOrderPlacementSuccess,
  toggleOrderSidebar,
} from "@/rtk/slices/toggleSlice";
import { clearCheckout } from "@/rtk/slices/checkoutSlice";
import { clearCart } from "@/rtk/slices/cartSlice";

const CONFETTI_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#b983ff",
  "#ff9f43",
];

function OrderSuccessCelebration() {  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector(
    (state) => state.toggle.showOrderPlacementSuccess
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${4 + ((i * 53) % 92)}%`,
        size: 6 + ((i * 7) % 6),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${(i % 6) * 0.18}s`,
        duration: `${2 + ((i * 3) % 5) / 4}s`,
        drift: `${((i % 5) - 2) * 14}px`,
        round: i % 3 === 0,
      })),
    []
  );

  const closeAndGoHome = () => {
    dispatch(setShowOrderPlacementSuccess(false));
    dispatch(clearCheckout());
    dispatch(clearCart());
    router.replace("/");
  };

  const handleTrackOrder = () => {
    dispatch(setShowOrderPlacementSuccess(false));
    dispatch(toggleOrderSidebar());
    document.body.classList.add("overflow-hidden");
    dispatch(clearCheckout());
    dispatch(clearCart());
    router.replace("/");
  };

  return (
    <Popup
      open={isOpen}
      onOpenChange={(open) => !open && closeAndGoHome()}
    >
      <PopupContent className="overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
        >
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={
                {
                  left: piece.left,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  borderRadius: piece.round ? "9999px" : "2px",
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                  "--confetti-drift": piece.drift,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-4 pt-8 text-center">
          <div className="relative">
            <span className="success-ring" />
            <span className="success-ring" style={{ animationDelay: "0.7s" }} />
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 50"
              className="success-pop relative w-20"
            >
              <circle style={{ fill: "#25AE88" }} cx="25" cy="25" r="25" />
              <polyline
                style={{
                  fill: "none",
                  stroke: "#FFFFFF",
                  strokeWidth: "4.2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeMiterlimit: "10",
                }}
                points="38,15 22,33 12,25"
              />
            </svg>
          </div>

          <PopupTitle className="text-2xl">{t("Thank You!")}</PopupTitle>
          <PopupDescription>{t("orderReceivedSuccessfully")}</PopupDescription>

          <div className="mt-2 flex w-full flex-col gap-2">
            <Button
              className="h-11 w-full rounded-full bg-color-11 text-base text-white hover:bg-color-11/90"
              onClick={handleTrackOrder}
            >
              <BikeIcon />
              {t("Track Order")}
            </Button>
            <Button
              variant="ghost"
              className="h-11 w-full rounded-full text-sm text-color-6 hover:bg-muted"
              onClick={closeAndGoHome}
            >
              {t("Continue Browsing")}
            </Button>
          </div>
        </div>
      </PopupContent>
    </Popup>
  );
}

export default OrderSuccessCelebration;
