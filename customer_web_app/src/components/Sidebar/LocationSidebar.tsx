"use client";

import { useState } from "react";
import { MapPinIcon, XCircleIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleLocationSidebar } from "@/rtk/slices/toggleSlice";
import { cn } from "@/lib/utils";

const LocationSidebar = () => {
  const t = useTranslations();
  const locale = useLocale();
  const [searchText, setSearchText] = useState("");

  const dispatch = useAppDispatch();
  const isLocationSidebarOpen = useAppSelector(
    (state) => state.toggle.isLocationSidebarOpen
  );

  const handleCloseSidebar = () => {
    dispatch(toggleLocationSidebar());
    document.body.classList.remove("overflow-hidden");
  };

  const isRTL = locale === "ar";

  return (
    <>
      <div
        className={cn(
          "location-sidebar fixed top-0 h-full overflow-y-scroll bg-white transition-all duration-500 z-40 sm:px-20 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px]",
          isRTL ? "left-0" : "right-0",
          isLocationSidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full"
        )}
      >
        <button className="text-3xl mb-5" onClick={handleCloseSidebar}>
          <XCircleIcon className="size-7" />
        </button>
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              className="h-[50px] text-base bg-transparent px-5 overflow-hidden border w-full font-ProximaNovaMed"
              placeholder={t("searchLocationPlaceholder")}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-4 text-sm top-1/2 -translate-y-1/2 text-color-2 font-ProximaNovaMed"
              >
                {t("Cancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "location-sidebar-overlay z-30 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden",
          isLocationSidebarOpen ? "fixed" : "hidden"
        )}
        onClick={handleCloseSidebar}
      ></div>
    </>
  );
};

export default LocationSidebar;
