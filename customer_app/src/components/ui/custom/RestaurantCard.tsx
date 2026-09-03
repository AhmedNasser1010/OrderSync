"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import OpenBadge from "@/components/Home/OpenBadge";
import { cn } from "@/lib/utils";
import isRestaurantAvailable from "@/utils/isRestaurantAvailable";
import type { BusinessDocument } from "@ordersync/types";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

interface RestaurantCardInfo {
  areaName?: string;
  name: string;
  nameInAr?: string;
  avgRating?: string | number;
  totalRatings?: number;
  cloudinaryImageId?: string;
  icon?: string;
  sla?: string;
  cuisines?: string[];
  promotionalSubtitle?: string;
  status?: string;
  openingHours?: OpeningHours;
  openNowUntil?: number;
  hasOffers?: boolean;
  className?: string;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="10" r="9" fill="#21973B"></circle>
      <path
        d="M10.0816 12.865C10.0312 12.8353 9.96876 12.8353 9.91839 12.865L7.31647 14.3968C6.93482 14.6214 6.47106 14.2757 6.57745 13.8458L7.27568 11.0245C7.29055 10.9644 7.26965 10.9012 7.22195 10.8618L4.95521 8.99028C4.60833 8.70388 4.78653 8.14085 5.23502 8.10619L8.23448 7.87442C8.29403 7.86982 8.34612 7.83261 8.36979 7.77777L9.54092 5.06385C9.71462 4.66132 10.2854 4.66132 10.4591 5.06385L11.6302 7.77777C11.6539 7.83261 11.706 7.86982 11.7655 7.87442L14.765 8.10619C15.2135 8.14085 15.3917 8.70388 15.0448 8.99028L12.7781 10.8618C12.7303 10.9012 12.7095 10.9644 12.7243 11.0245L13.4225 13.8458C13.5289 14.2757 13.0652 14.6214 12.6835 14.3968L10.0816 12.865Z"
        fill="white"
      ></path>
    </svg>
  );
}

function RestaurantCard({ info, compact }: { info: RestaurantCardInfo; compact?: boolean }) {
  const {
    areaName,
    name,
    nameInAr,
    avgRating,
    cloudinaryImageId,
    icon,
    sla,
    cuisines,
    promotionalSubtitle,
    status,
    openingHours,
    openNowUntil,
    hasOffers,
    className,
  } = info;
  const locale = useLocale();
  const t = useTranslations();
  const resName = locale === "ar" ? nameInAr || name : name;

  const isAvailable = isRestaurantAvailable({ status, openingHours, openNowUntil });

  const ratingLabel = avgRating !== undefined ? Number(avgRating).toFixed(1) : null;

  return (
    <div
      className={cn(
        "group flex flex-col gap-2.5 cursor-pointer overflow-hidden rounded-2xl border border-color-7 bg-card p-2.5 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-color-7">
        <Image
          src={cloudinaryImageId || "/assets/restaurant-default-cover.jpg"}
          alt={resName || name}
          loading="lazy"
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ filter: isAvailable ? "grayscale(0)" : "grayscale(1)" }}
        />
        {icon && !compact && (
          <Image
            src={icon}
            alt=""
            loading="lazy"
            width={34}
            height={34}
            className="absolute bottom-2 end-2 size-8 rounded-lg object-cover shadow-md ring-2 ring-white bg-white"
          />
        )}
        {promotionalSubtitle && (
          <p
            style={{ textShadow: "2px 2px 5px black" }}
            className="absolute font-black bottom-2 start-2 text-white uppercase tracking-tighter text-[15px] leading-none"
          >
            {promotionalSubtitle}
          </p>
        )}
        <span className="absolute top-2 start-2">
          <OpenBadge
            status={status}
            openingHours={openingHours}
            openNowUntil={openNowUntil}
            className={cn("px-2 text-[10px]", compact && "px-1.5 text-[8px]")}
          />
        </span>
        {hasOffers && (
          <span className={cn("absolute top-2 end-2 z-10 rounded-full bg-gradient-to-r from-color-2 to-[#ffab4a] font-ProximaNovaBold uppercase tracking-wide text-white shadow-lg shadow-color-2/30", compact ? "px-1.5 py-px text-[8px]" : "px-2.5 py-0.5 text-[10px]")}>
            {t("Offers")}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-1 pb-0.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-GrotBold text-[15px] leading-tight tracking-tighter text-color-1 truncate">
            {resName}
          </h2>
          {ratingLabel && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-color-11 px-1.5 py-0.5 text-white font-ProximaNovaSemiBold">
              <StarIcon className="size-2.5" />
              <span className="text-[11px]">{ratingLabel}</span>
            </span>
          )}
        </div>
        {cuisines && cuisines.length > 0 && (
          <p className="truncate text-xs font-ProximaNovaSemiBold text-color-3">
            {compact ? t(cuisines[0]) : cuisines.map((cuisine) => t(cuisine)).join(", ")}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[11px] font-ProximaNovaThin text-color-5">
          {sla && <span>{sla}</span>}
          {areaName && (
            <>
              <span className="size-0.5 rounded-full bg-color-8" />
              <span className="truncate">{areaName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
