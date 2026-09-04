"use client";

import { useEffect } from "react";
import Image from "next/image";
import { StoreIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setMenuIsOpen } from "@/rtk/slices/toggleSlice";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  Popup,
  PopupContent,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { IS_COMING_SOON, isComingSoonExemptPath } from "@/utils/comingSoon";
import { LOGO_URL } from "@/utils/constants";

function ComingSoonGate() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isMenuOpen = useAppSelector((state) => state.toggle.isMenuOpen);
  const { isAuthenticated } = useAuthSession();

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
        className="sm:max-w-md text-center"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a] shadow-lg shadow-color-2/25">
          <Image src={LOGO_URL} alt={t("Zajil")} width={40} height={40} className="object-contain" />
        </div>
        <div>
          <PopupTitle>{t("Stay tuned for the opening")}</PopupTitle>
          <PopupDescription>
            {t("comingSoonDescription")}
          </PopupDescription>
        </div>
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => dispatch(setMenuIsOpen(true))}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-color-2 py-3.5 font-ProximaNovaSemiBold text-white shadow-lg shadow-color-2/30 transition-all hover:bg-color-2/90 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
          >
            <StoreIcon className="size-4" />
            {t("Create Your Account")}
          </button>
        )}
      </PopupContent>
    </Popup>
  );
}

export default ComingSoonGate;