"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import OpenBadge from "@/components/Home/OpenBadge";
import { cn } from "@/lib/utils";
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
  className?: string;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
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

function RestaurantCard({ info }: { info: RestaurantCardInfo }) {
  const {
    areaName,
    name,
    nameInAr,
    avgRating,
    totalRatings,
    cloudinaryImageId,
    icon,
    sla,
    cuisines,
    promotionalSubtitle,
    status,
    openingHours,
    openNowUntil,
    className,
  } = info;
  const locale = useLocale();
  const t = useTranslations();
  const resName = locale === "ar" ? nameInAr || name : name;

  const isAvailable = status === "active" || status === "busy";

  const renderRatings = () => {
    if (avgRating === undefined) return null;
    const rating = Number(avgRating);
    const ratingLabel = Number.isFinite(rating)
      ? rating.toFixed(1)
      : String(avgRating);

    return (
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded bg-color-11 px-1.5 py-0.5 text-white font-ProximaNovaSemiBold">
          <StarIcon className="size-3" />
          <span className="text-xs">{ratingLabel}</span>
        </span>
        {totalRatings !== undefined && totalRatings > 0 && (
          <span className="text-xs text-color-4 font-GrotThin">
            ({totalRatings > 999 ? `${(totalRatings / 1000).toFixed(1)}k` : totalRatings}{" "}
            {t("ratings")})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-3 cursor-pointer", className)}>
      <div className="w-full h-56 relative rounded-xl overflow-hidden bg-color-7">
        {cloudinaryImageId && (
          <Image
            src={cloudinaryImageId}
            alt={resName || name}
            loading="lazy"
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ filter: isAvailable ? "grayscale(0)" : "grayscale(1)" }}
          />
        )}
        {icon && (
          <Image
            src={icon}
            alt=""
            loading="lazy"
            width={40}
            height={40}
            className="absolute bottom-2 end-2 size-10 rounded-lg object-cover shadow-md ring-2 ring-white bg-white"
          />
        )}
        {promotionalSubtitle && (
          <p
            style={{ textShadow: "2px 2px 5px black" }}
            className="absolute font-black bottom-3 start-3 text-white uppercase tracking-tighter text-[22px] leading-none"
          >
            {promotionalSubtitle}
          </p>
        )}
        <span className="absolute top-2 start-2">
          <OpenBadge
            status={status}
            openingHours={openingHours}
            openNowUntil={openNowUntil}
          />
        </span>
      </div>
      <div className="mx-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-GrotBold text-lg tracking-tighter text-color-3 truncate">
            {resName}
          </h2>
          <div className="shrink-0">{renderRatings()}</div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-sm font-ProximaNovaSemiBold text-color-3">
          {sla && <span>{sla}</span>}
          {cuisines && cuisines.length > 0 && (
            <>
              <span className="size-1 shrink-0 rounded-full bg-color-8" />
              <span className="truncate">{cuisines.join(", ")}</span>
            </>
          )}
        </div>
        <div className="font-GrotThin text-color-4 tracking-tight text-base truncate mt-0.5">
          {areaName}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
