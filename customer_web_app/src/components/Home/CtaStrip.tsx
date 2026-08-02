"use client";

import { PhoneIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { RESTAURANT_PHONE } from "@/utils/constants";

function CtaStrip() {
  const t = useTranslations();

  const items = [
    { icon: MapPinIcon, text: t("Deliver to") + ": " + t("El-Ayat") },
    { icon: ClockIcon, text: t("Working hours info") },
    { icon: PhoneIcon, text: RESTAURANT_PHONE },
  ];

  return (
    <>
      <div className="divider"></div>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-color-1 via-color-9 to-color-1 p-8 sm:p-10">
        <div className="absolute -top-10 -end-10 size-40 rounded-full bg-color-2/20 blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-lg">
            <h3 className="font-ProximaNovaBold text-2xl text-white sm:text-3xl">
              {t("Cta strip title")}
            </h3>
            <p className="mt-2 font-ProximaNovaThin text-white/80">
              {t("Cta strip subtitle")}
            </p>
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-3 text-sm font-ProximaNovaMed text-white/85"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">
                    <item.icon className="size-4 text-color-2" />
                  </span>
                  <span dir="auto">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <a
            href={`tel:${RESTAURANT_PHONE}`}
            className="flex shrink-0 items-center gap-2 rounded-full bg-color-2 px-8 py-4 font-ProximaNovaSemiBold text-white shadow-lg shadow-color-2/30 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
          >
            <PhoneIcon className="size-5" />
            {t("Call us to order")}
          </a>
        </div>
      </section>
    </>
  );
}

export default CtaStrip;
