"use client";

import { useEffect } from "react";
import Image from "next/image";
import { WrenchIcon, CalendarDaysIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/rtk/hooks";
import { useFetchServicesQuery } from "@/rtk/api/firestoreApi";
import { LOGO_URL } from "@/utils/constants";

function MaintenanceGate() {
  const t = useTranslations();
  const { data: servicesConfig } = useFetchServicesQuery();
  const maintenance = useAppSelector((state) => state.services.maintenance);

  const maintenanceData = servicesConfig?.maintenance ?? maintenance;
  const enabled = maintenanceData?.enabled ?? false;

  useEffect(() => {
    if (!enabled) return;
    const className = "overflow-hidden";
    const hadClass = document.body.classList.contains(className);
    document.body.classList.add(className);
    return () => {
      if (!hadClass) document.body.classList.remove(className);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-background p-6"
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a] shadow-lg shadow-color-2/25">
          <Image
            src={LOGO_URL}
            alt={t("Zajil")}
            width={44}
            height={44}
            className="object-contain"
          />
        </div>

        <div className="mt-6 flex items-center gap-2 text-color-2">
          <WrenchIcon className="size-5" />
          <span className="font-ProximaNovaSemiBold text-sm uppercase tracking-wide">
            {t("maintenanceBadge")}
          </span>
        </div>

        <h1 className="mt-3 font-Beiruti text-3xl leading-tight text-color-1">
          {t("maintenanceTitle")}
        </h1>

        <p className="mt-3 font-ProximaNovaRegular text-base leading-relaxed text-color-6">
          {maintenanceData?.message?.trim()
            ? maintenanceData.message
            : t("maintenanceDescription")}
        </p>

        {maintenanceData?.eta?.trim() && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-color-7 bg-card px-4 py-3">
            <CalendarDaysIcon className="size-4 text-color-5" />
            <span className="font-ProximaNovaSemiBold text-sm text-color-1">
              {t("maintenanceBackOn")} {maintenanceData.eta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaintenanceGate;
