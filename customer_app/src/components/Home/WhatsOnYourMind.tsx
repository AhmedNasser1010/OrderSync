"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addFilter, clearAll } from "@/rtk/slices/filterSlice";
import type { RestaurantDocument } from "@/types/restaurant";
import { cn } from "@/lib/utils";

const CATEGORY_IMAGES: Record<string, string> = {
  crepes: "/images/dishes/crepes-icon.webp",
  "eastern-pie": "/images/dishes/eastern-pie-icon.webp",
  negresco: "/images/dishes/negresco-icon.webp",
  pizza: "/images/dishes/pizza-icon.webp",
  sandwich: "/images/dishes/sandwich-icon.webp",
};

function WhatsOnYourMind({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const activeFilter = useAppSelector((state) => state.filter);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    restaurants.forEach((res: RestaurantDocument) => {
      (res?.profile?.cuisines || []).forEach((tag) => {
        if (!map.has(tag)) {
          map.set(tag, CATEGORY_IMAGES[tag] || res?.branding?.cover || "");
        }
      });
    });
    return Array.from(map.entries()).map(([id, img]) => ({ id, img }));
  }, [restaurants]);

  if (categories.length === 0) return null;

  const handleTriggerFilter = (tag: string) => {
    if (activeFilter.includes(tag)) {
      dispatch(clearAll());
    } else {
      dispatch(clearAll());
      dispatch(addFilter(tag));
    }
    document
      .getElementById("restaurants")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="img-carousel" className="pt-6">
      <div className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-2">
        {categories.map((category, i) => {
          const isActive = activeFilter.includes(category.id);
          const isFirst = i === 0;
          const isLast = i === categories.length - 1;
          return (
            <button
              type="button"
              key={category?.id}
              onClick={() => handleTriggerFilter(category.id)}
              aria-pressed={isActive}
              className={cn(
                "group flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-2xl border bg-card p-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none",
                isActive
                  ? "border-color-2/50 shadow-md shadow-color-2/10"
                  : "border-color-7 shadow-sm hover:-translate-y-0.5 hover:shadow-md",
                isFirst && "ms-4 sm:ms-10",
                isLast && "me-4 sm:me-10",
              )}
            >
              <span className="relative grid size-17 place-items-center overflow-hidden rounded-xl">
                {category?.img ? (
                  <Image
                    src={category.img}
                    alt={t(category.id)}
                    loading="lazy"
                    width={64}
                    height={64}
                    className="size-21 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-2xl" aria-hidden="true">
                    🍽️
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-0 bg-color-2/15" />
                )}
              </span>
              <span
                className={cn(
                  "font-GrotBold text-sm tracking-tight transition-colors",
                  isActive ? "text-color-2" : "text-color-3",
                )}
              >
                {t(category.id)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default WhatsOnYourMind;
