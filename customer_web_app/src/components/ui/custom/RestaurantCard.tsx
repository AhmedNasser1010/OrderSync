"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import StatusBadge from "@/components/ui/custom/StatusBadge";
import { cn } from "@/lib/utils";

interface RestaurantCardInfo {
  areaName?: string;
  name: string;
  nameInAr?: string;
  avgRating?: string | number;
  cloudinaryImageId?: string;
  sla?: string;
  cuisines?: string[];
  promotionalSubtitle?: string;
  status?: string;
  className?: string;
}

function RestaurantCard({ info }: { info: RestaurantCardInfo }) {
  const {
    areaName,
    name,
    nameInAr,
    avgRating,
    cloudinaryImageId,
    sla,
    cuisines,
    promotionalSubtitle,
    status,
    className,
  } = info;
  const locale = useLocale();
  const [resName, setResName] = useState(nameInAr);

  useEffect(() => {
    setResName(locale === "ar" ? nameInAr : name);
  }, [locale, name, nameInAr]);

  const truncateCuisine = (str?: string) => {
    return str && str?.length >= 33 ? str.slice(0, 33) + "..." : str;
  };

  const truncateResName = (str?: string) => {
    return str && str?.length >= 30 ? str.slice(0, 30) + "..." : str;
  };

  return (
    <div className={cn("flex flex-col gap-3 cursor-pointer", className)}>
      <div className="w-full h-56 relative rounded-xl overflow-hidden">
        {cloudinaryImageId && (
          <img
            src={cloudinaryImageId}
            alt="res-img"
            className="rounded-xl w-full h-full object-cover"
            style={{ filter: status === "inactive" ? "grayscale(1)" : "grayscale(0)" }}
          />
        )}
        {promotionalSubtitle && (
          <p
            style={{ textShadow: "2px 2px 5px black" }}
            className="absolute font-black bottom-3 left-3 text-white uppercase tracking-tighter text-[22px]"
          >
            {promotionalSubtitle}
          </p>
        )}
      </div>
      <div className="ml-3">
        <h2 className="font-GrotBold text-lg tracking-tighter text-color-3 flex items-center gap-2 flex-wrap">
          {truncateResName(resName)}
          <StatusBadge status={status} />
        </h2>
        <div className="font-GrotBold flex gap-1 text-color-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" role="img" aria-hidden="true">
            <circle cx="10" cy="10" r="9" fill="#21973B"></circle>
            <path
              d="M10.0816 12.865C10.0312 12.8353 9.96876 12.8353 9.91839 12.865L7.31647 14.3968C6.93482 14.6214 6.47106 14.2757 6.57745 13.8458L7.27568 11.0245C7.29055 10.9644 7.26965 10.9012 7.22195 10.8618L4.95521 8.99028C4.60833 8.70388 4.78653 8.14085 5.23502 8.10619L8.23448 7.87442C8.29403 7.86982 8.34612 7.83261 8.36979 7.77777L9.54092 5.06385C9.71462 4.66132 10.2854 4.66132 10.4591 5.06385L11.6302 7.77777C11.6539 7.83261 11.706 7.86982 11.7655 7.87442L14.765 8.10619C15.2135 8.14085 15.3917 8.70388 15.0448 8.99028L12.7781 10.8618C12.7303 10.9012 12.7095 10.9644 12.7243 11.0245L13.4225 13.8458C13.5289 14.2757 13.0652 14.6214 12.6835 14.3968L10.0816 12.865Z"
              fill="white"
            ></path>
          </svg>
          <span>{avgRating} • </span>
          {sla}
        </div>
        <p className="font-GrotThin text-color-4 tracking-tight text-base -mb-1">
          {truncateCuisine(cuisines?.join(", "))}
        </p>
        <div className="font-GrotThin text-color-4 tracking-tight text-base">{areaName}</div>
      </div>
    </div>
  );
}

export default RestaurantCard;
