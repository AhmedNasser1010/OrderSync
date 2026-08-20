"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "../shared/SectionHeading";
import { CustomerSection } from "../showcase/CustomerSection";
import { OnboardingSection } from "../showcase/OnboardingSection";
import { OrdersSection } from "../showcase/OrdersSection";
import { DriverSection } from "../showcase/DriverSection";
import { ManagerSection } from "../showcase/ManagerSection";

export function AppShowcase() {
  const t = useTranslations("showcase");

  return (
    <section id="showcase">
      <div className="pt-20 bg-white">
        <SectionHeading
          title={t("section_title")}
          subtitle={t("section_subtitle")}
        />
      </div>

      <CustomerSection />
      <OnboardingSection />
      <OrdersSection />
      <DriverSection />
      <ManagerSection />
    </section>
  );
}
