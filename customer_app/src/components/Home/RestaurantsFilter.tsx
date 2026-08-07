"use client";

import { useTranslations } from "next-intl";
import Filter from "@/components/Home/Filter";

function RestaurantsFilter() {
  const t = useTranslations();
  return (
    <div className="filter-btns flex gap-3 2xl:justify-start justify-center md:flex-nowrap flex-wrap">
      <Filter filterId="offers">{t("Offers")}</Filter>
      <Filter filterId="crepes">{t("crepes")}</Filter>
      <Filter filterId="eastern-pie">{t("eastern-pie")}</Filter>
      <Filter filterId="negresco">{t("negresco")}</Filter>
      <Filter filterId="pizza">{t("pizza")}</Filter>
      <Filter filterId="sandwich">{t("sandwich")}</Filter>
    </div>
  );
}

export default RestaurantsFilter;
