"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface CarouselArrowsProps {
  onLeft: () => void;
  onRight: () => void;
  className?: string;
  buttonClassName?: string;
}

function CarouselArrows({
  onLeft,
  onRight,
  className,
  buttonClassName,
}: CarouselArrowsProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === "ar";

  const base = cn(
    "flex justify-center cursor-pointer rounded-full border border-color-7 p-2.5 hover:bg-color-7/30",
    buttonClassName
  );

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        aria-label={t("Previous")}
        onClick={onLeft}
        className={cn(base, isRTL && "order-1")}
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t("Next")}
        onClick={onRight}
        className={base}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}

export default CarouselArrows;
