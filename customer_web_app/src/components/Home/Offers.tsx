"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/Home/SectionHeader";
import type { RestaurantDocument } from "@/types/restaurant";

function Offers({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  if (restaurants.length < 4) return null;

  return (
    <>
      <div className="divider"></div>
      <section id="offers">
        <SectionHeader title={t("Offers just for you")} />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 max-w-[1500px]">
          {restaurants.map((res) => (
            <Link
              key={res?.accessToken}
              href={`/${res?.profile.name.split(" ").join("-")}`}
              className="group relative block shrink-0 w-80 sm:w-[340px] h-44 rounded-2xl overflow-hidden transition-all hover:scale-[0.98]"
            >
              {res?.branding?.cover && (
                <img
                  src={res.branding.cover}
                  alt={res?.profile?.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute top-3 start-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-ProximaNovaSemiBold text-color-11 shadow-sm">
                {t("Offers")}
              </span>
              {res?.branding?.promotionalSubtitle && (
                <p
                  className="absolute bottom-3 start-3 end-3 font-black text-white uppercase tracking-tighter text-xl leading-tight"
                  style={{ textShadow: "2px 2px 5px black" }}
                >
                  {res.branding.promotionalSubtitle}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default Offers;
