"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  BikeIcon,
  CircleCheckBigIcon,
  ShoppingBagIcon,
  SparkleIcon,
  SparklesIcon,
  StoreIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAppSelector } from "@/rtk/hooks";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  Popup,
  PopupContent,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { IS_COMING_SOON, isComingSoonExemptPath } from "@/utils/comingSoon";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { DownloadIcon } from "lucide-react";
import { LOGO_URL } from "@/utils/constants";

function ComingSoonGate() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const isMenuOpen = useAppSelector((state) => state.toggle.isMenuOpen);
  const { isAuthenticated } = useAuthSession();
  const { canInstall, promptInstall } = usePwaInstall();

  useEffect(() => {
    if (IS_COMING_SOON && pathname !== "/" && !isComingSoonExemptPath(pathname)) {
      router.replace("/");
    }
  }, [pathname, router]);

  useEffect(() => {
    if (isMenuOpen) return;
    if (!IS_COMING_SOON) return;
    if (isComingSoonExemptPath(pathname)) return;
    const className = "overflow-hidden";
    const hadClass = document.body.classList.contains(className);
    document.body.classList.add(className);
    return () => {
      if (!hadClass) document.body.classList.remove(className);
    };
  }, [isMenuOpen, pathname]);

  if (!IS_COMING_SOON) return null;
  if (isMenuOpen) return null;
  if (isComingSoonExemptPath(pathname)) return null;

  return (
    <Popup open onOpenChange={() => {}}>
      <PopupContent
        className="sm:max-w-md gap-0 overflow-hidden rounded-3xl p-0 text-center shadow-2xl shadow-color-2/10"
        overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
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
            {t("comingSoonBadge")}
          </span>
          <div
            className="flex animate-in fade-in fill-mode-backwards flex-col items-center gap-2"
            style={{ animationDelay: "200ms" }}
          >
            <PopupTitle className="text-xl">
              {t("Stay tuned for the opening")}
            </PopupTitle>
            <PopupDescription className="max-w-xs">
              {t("comingSoonDescription")}
            </PopupDescription>
          </div>
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="flex w-full cursor-pointer animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards items-center justify-center gap-2 rounded-2xl bg-color-2 py-3.5 font-ProximaNovaSemiBold text-white shadow-lg shadow-color-2/30 transition-all hover:bg-color-2/90 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
              style={{ animationDelay: "300ms" }}
            >
              <StoreIcon className="size-4" />
              {t("Create Your Account")}
            </button>
          ) : (
            <div
              className="flex w-full animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards items-center justify-center gap-2 rounded-2xl border border-color-2/40 bg-color-2/10 py-3.5 font-ProximaNovaSemiBold text-color-2"
              style={{ animationDelay: "300ms" }}
            >
              <CircleCheckBigIcon className="size-4" />
              {t("thanksForSigningIn")}
            </div>
          )}

          {canInstall && (
            <button
              type="button"
              onClick={() => promptInstall()}
              className="flex w-full cursor-pointer animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards items-center justify-center gap-2 rounded-2xl border border-color-2/40 bg-color-2/10 py-3 font-ProximaNovaSemiBold text-color-2 transition-all hover:bg-color-2/20 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
              style={{ animationDelay: "400ms" }}
            >
              <DownloadIcon className="size-4" />
              {t("Install the app")}
            </button>
          )}
        </div>
      </PopupContent>
    </Popup>
  );
}

export default ComingSoonGate;