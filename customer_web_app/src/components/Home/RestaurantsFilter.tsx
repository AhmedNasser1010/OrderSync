"use client";

import { useTranslations } from "next-intl";
import Filter from "@/components/Home/Filter";

function RestaurantsFilter() {
  const t = useTranslations();
  return (
    <div className="filter-btns flex gap-3 2xl:justify-start justify-center md:flex-nowrap flex-wrap">
      <Filter filterId="offers">{t("Offers")}</Filter>
      <Filter filterId="sandwiches">{t("Sandwiches")}</Filter>
      <Filter filterId="crepes">{t("Crepes")}</Filter>
      <Filter filterId="italian-pizza">{t("Italian Pizza")}</Filter>
      <Filter filterId="pasta">{t("Pasta")}</Filter>
    </div>
  );
}

export default RestaurantsFilter;
