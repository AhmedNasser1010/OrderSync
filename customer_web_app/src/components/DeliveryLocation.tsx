"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPinIcon, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleLoginSidebar } from "@/rtk/slices/toggleSlice";
import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupTitle,
  PopupFooter,
} from "@/components/ui/custom/Popup";
import useUserForm from "@/hooks/useUserForm";
import { cn } from "@/lib/utils";

const FindUserLocationMap = dynamic(
  () => import("@/components/Sidebar/FindUserLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] rounded-xl bg-color-7/30 animate-pulse" />
    ),
  }
);

const DEFAULT_LOCATION: [number, number] = [29.620106778124843, 31.255811811669496];

interface DeliveryLocationProps {
  variant?: "bar" | "compact";
  className?: string;
}

function DeliveryLocation({ variant = "bar", className }: DeliveryLocationProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { saveLocation } = useUserForm();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<[number, number] | null>(null);

  const isLoggedIn = !!user?.userInfo?.uid;
  const address = user?.locations?.home?.address || t("El-Ayat");

  const handleClick = () => {
    if (!isLoggedIn) {
      dispatch(toggleLoginSidebar());
      return;
    }
    setPicked(
      user?.locations?.home?.latlng?.[0]
        ? (user.locations.home.latlng as [number, number])
        : null
    );
    setOpen(true);
  };

  const handleSave = async () => {
    if (picked) {
      await saveLocation(picked);
    }
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-2.5 rounded-full border border-color-7 bg-white shadow-sm transition-all hover:border-color-2/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none cursor-pointer",
          variant === "compact"
            ? "py-1.5 ps-3 pe-2"
            : "py-2.5 ps-4 pe-3",
          className
        )}
        aria-label={t("Deliver to")}
      >
        <MapPinIcon className="size-4 shrink-0 text-color-2" />
        <span className="flex flex-col items-start leading-none">
          {variant === "bar" && (
            <span className="text-[10px] uppercase tracking-wider font-ProximaNovaSemiBold text-color-5">
              {t("Deliver to")}
            </span>
          )}
          <span className="max-w-28 truncate text-sm font-ProximaNovaSemiBold text-color-1">
            {address}
          </span>
        </span>
        <ChevronDownIcon className="size-4 text-color-5 transition-transform group-hover:rotate-180" />
      </button>

      <Popup open={open} onOpenChange={setOpen}>
        <PopupContent className="sm:max-w-md">
          <PopupHeader closePopupCallback={() => setOpen(false)}>
            <PopupTitle>{t("Choose delivery location")}</PopupTitle>
          </PopupHeader>
          <div className="overflow-hidden rounded-xl ring-1 ring-color-7">
            <FindUserLocationMap
              userLocation={picked}
              defaultLocation={DEFAULT_LOCATION}
              onChange={(value) => setPicked(value)}
            />
          </div>
          <PopupFooter>
            <button
              type="button"
              onClick={handleSave}
              className="w-full cursor-pointer rounded-xl bg-color-2 py-3.5 text-center text-white font-ProximaNovaSemiBold transition-colors hover:bg-color-2/90 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
            >
              {t("Save")}
            </button>
          </PopupFooter>
        </PopupContent>
      </Popup>
    </>
  );
}

export default DeliveryLocation;
