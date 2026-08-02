"use client";

import { SearchIcon, ClipboardListIcon, BikeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/Home/SectionHeader";

const steps = [
  {
    icon: SearchIcon,
    titleKey: "How it works step 1 title",
    descKey: "How it works step 1 desc",
    color: "bg-color-2/10 text-color-2",
  },
  {
    icon: ClipboardListIcon,
    titleKey: "How it works step 2 title",
    descKey: "How it works step 2 desc",
    color: "bg-color-11/10 text-color-11",
  },
  {
    icon: BikeIcon,
    titleKey: "How it works step 3 title",
    descKey: "How it works step 3 desc",
    color: "bg-blue-100 text-blue-600",
  },
];

function HowItWorks() {
  const t = useTranslations();

  return (
    <>
      <div className="divider"></div>
      <section id="how-it-works">
        <SectionHeader
          title={t("How Zack's Eats works")}
          className="justify-center text-center"
          titleClassName="text-center"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.titleKey}
              className="relative flex flex-col items-center gap-3 rounded-2xl border border-color-7 bg-white p-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="absolute top-4 start-4 text-xs font-ProximaNovaBlack text-color-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`grid size-14 place-items-center rounded-2xl ${step.color}`}
              >
                <step.icon className="size-7" />
              </span>
              <h3 className="font-ProximaNovaSemiBold text-lg text-color-1">
                {t(step.titleKey)}
              </h3>
              <p className="font-ProximaNovaThin text-sm text-color-6 leading-relaxed">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default HowItWorks;
