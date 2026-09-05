"use client";

import Image from "next/image";
import {
  BikeIcon,
  LogInIcon,
  ShoppingBagIcon,
  SparkleIcon,
  SparklesIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setShowLoginPromptPopup } from "@/rtk/slices/toggleSlice";
import {
  Popup,
  PopupContent,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { LOGO_URL } from "@/utils/constants";

function LoginPromptDialog() {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.toggle.showLoginPromptPopup
  );

  const close = () => dispatch(setShowLoginPromptPopup(false));

  const goToSignIn = () => {
    close();
    router.push("/signin");
  };

  return (
    <Popup open={isOpen} onOpenChange={(next) => (next ? undefined : close())}>
      <PopupContent
        className="sm:max-w-md gap-0 overflow-hidden rounded-3xl p-0 text-center shadow-2xl shadow-color-2/10"
        overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-md"
      >
        {/* Hero band */}
        <div
          aria-hidden
          className="relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a]"
        >
          {/* Floating decorative accents */}
          <SparklesIcon className="absolute top-4 left-6 size-5 text-white/40 animate-pulse" />
          <ShoppingBagIcon className="absolute right-7 bottom-6 size-6 text-white/30" />
          <BikeIcon className="absolute top-6 right-12 size-5 text-white/25" />
          <SparkleIcon className="absolute bottom-5 left-10 size-4 text-white/35" />
          <div className="absolute -top-10 -left-10 size-28 rounded-full bg-white/10" />
          <div className="absolute -right-8 -bottom-12 size-32 rounded-full bg-white/10" />

          {/* Logo in white circle with pulse ring */}
          <div className="relative grid place-items-center">
            <div className="absolute size-20 rounded-full bg-white/40 animate-ping [animation-duration:2s]" />
            <div className="relative grid size-20 place-items-center rounded-full bg-white shadow-lg shadow-color-1/20">
              <Image
                src={LOGO_URL}
                alt={t("Zajil")}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-5">
          <span
            className="animate-in fade-in fill-mode-backwards rounded-full bg-color-2/10 px-3 py-1 font-ProximaNovaSemiBold text-xs tracking-wide text-color-2 uppercase"
            style={{ animationDelay: "100ms" }}
          >
            {t("loginPromptBadge")}
          </span>
          <div
            className="flex animate-in fade-in fill-mode-backwards flex-col items-center gap-2"
            style={{ animationDelay: "200ms" }}
          >
            <PopupTitle className="text-xl">
              {t("loginPromptTitle")}
            </PopupTitle>
            <PopupDescription className="max-w-xs">
              {t("loginPromptDescription")}
            </PopupDescription>
          </div>
          <button
            type="button"
            onClick={goToSignIn}
            className="flex w-full cursor-pointer animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards items-center justify-center gap-2 rounded-2xl bg-color-2 py-3.5 font-ProximaNovaSemiBold text-white shadow-lg shadow-color-2/30 transition-all hover:bg-color-2/90 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
            style={{ animationDelay: "300ms" }}
          >
            <LogInIcon className="size-4" />
            {t("loginPromptCta")}
          </button>
        </div>
      </PopupContent>
    </Popup>
  );
}

export default LoginPromptDialog;
