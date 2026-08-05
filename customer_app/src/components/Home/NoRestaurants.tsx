"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const NoRestaurants = () => {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div>
      <span
        className={cn(
          "block font-Beiruti text-gray-500 text-center font-bold max-w-[190px] mx-auto py-6 leading-6",
          locale === "ar" ? "text-3xl" : "text-[23px]"
        )}
      >
        {t("No Restaurants found, try another filter")}
      </span>
      <Image
        src="/assets/restaurant.png"
        alt="no restaurants"
        width={224}
        height={166}
        className="w-56 mx-auto pb-28 grayscale"
      />
    </div>
  );
};

export default NoRestaurants;
