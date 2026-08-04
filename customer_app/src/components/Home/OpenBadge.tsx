"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import workingDaysChecker from "@/utils/workingDaysChecker";
import type { BusinessDocument } from "@ordersync/types";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

interface OpenBadgeProps {
  status?: string;
  openingHours?: OpeningHours;
  openNowUntil?: number;
  className?: string;
}

function OpenBadge({ status, openingHours, openNowUntil, className }: OpenBadgeProps) {
  const t = useTranslations();
  const isOpenNow = workingDaysChecker(openingHours, undefined, openNowUntil);

  let label = t("active");
  let color = "bg-color-11/10 text-color-11";

  if (status === "busy") {
    label = t("busy");
    color = "bg-amber-100 text-amber-700";
  } else if (status === "pause") {
    label = t("pause");
    color = "bg-color-7 text-color-6";
  } else if (status === "inactive" || isOpenNow === false) {
    label = t("inactive");
    color = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-ProximaNovaSemiBold whitespace-nowrap",
        color,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default OpenBadge;
