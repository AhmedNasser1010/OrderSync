"use client";

import { useMemo } from "react";
import { ArrowDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RestaurantDocument } from "@/types/restaurant";

function HeroBanner({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  const hero = useMemo(() => {
    const withPromo = restaurants.find((r) => r.branding?.promotionalSubtitle);
    return withPromo || restaurants[0];
  }, [restaurants]);

  if (!hero) return null;

  const scrollToRestaurants = () => {
    document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a]">
      {hero.branding?.cover && (
        <img
          src={hero.branding.cover}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
      <div className="relative flex flex-col items-start gap-4 px-6 py-10 sm:px-12 sm:py-14">
        <p className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-ProximaNovaSemiBold uppercase tracking-widest text-white backdrop-blur-sm">
          {t("Zack's Eats")}
        </p>
        <h2 className="max-w-xl font-ProximaNovaBlack text-3xl leading-tight text-white sm:text-5xl">
          {t("Hero title")}
        </h2>
        <p className="max-w-md font-ProximaNovaThin text-base text-white/90 sm:text-lg">
          {t("Hero subtitle")}
        </p>
        <button
          type="button"
          onClick={scrollToRestaurants}
          className="mt-2 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-ProximaNovaSemiBold text-[#282c3f] shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/60 outline-none cursor-pointer"
        >
          {t("Order now")}
          <ArrowDownIcon className="size-4" />
        </button>
      </div>
    </section>
  );
}

export default HeroBanner;
