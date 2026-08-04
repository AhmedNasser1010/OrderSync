"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addFilter, clearAll } from "@/rtk/slices/filterSlice";
import SectionHeader from "@/components/Home/SectionHeader";
import type { RestaurantDocument } from "@/types/restaurant";

const CATEGORY_IMAGES: Record<string, string> = {
  "italian-pizza": "https://i.imgur.com/avMww3r.jpg",
  sandwiches: "https://i.imgur.com/jh2GEIS.jpg",
  pasta: "https://i.imgur.com/y44eLlr.jpg",
  crepes: "https://i.imgur.com/y44eLlr.jpg",
};

function WhatsOnYourMind() {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === "ar";
  const restaurants = useAppSelector((state) => state.restaurants);

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

  const scrollBy = (dir: number) => {
    const el = document.querySelector<HTMLElement>(".food-category");
    el?.scrollBy({ left: dir * 250, behavior: "smooth" });
  };

  const handleTriggerFilter = (tag: string) => {
    dispatch(clearAll());
    dispatch(addFilter(tag));
    document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="divider"></div>
      <section id="img-carousel" className="relative">
        <SectionHeader
          title={t("What's on your mind?")}
          arrows
          onLeft={() => scrollBy(isRTL ? 250 : -250)}
          onRight={() => scrollBy(isRTL ? -250 : 250)}
        />
        <div className="food-category overflow-x-auto scroll-smooth scrollbar-hide max-w-[1500px] pb-2">
          <div className="flex gap-6">
            {categories.map((category) => (
              <button
                type="button"
                key={category?.id}
                onClick={() => handleTriggerFilter(category.id)}
                className="group flex shrink-0 cursor-pointer flex-col items-center gap-2 focus-visible:ring-2 focus-visible:ring-color-2/50 rounded-xl outline-none"
              >
                <span className="block w-36">
                  {category?.img && (
                    <img
                      src={category.img}
                      alt={t(category.id)}
                      loading="lazy"
                      className="h-36 w-36 rounded-full object-cover ring-4 ring-transparent transition-all duration-300 group-hover:scale-105 group-hover:ring-color-7"
                    />
                  )}
                </span>
                <span className="font-GrotMed text-color-3 text-sm tracking-tight">
                  {t(category.id)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default WhatsOnYourMind;
