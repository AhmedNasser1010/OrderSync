"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import SectionHeader from "@/components/Home/SectionHeader";
import { useFetchMenuDataQuery } from "@/rtk/api/firestoreApi";
import type { MainMenuType, ItemType } from "@ordersync/types";
import type { RestaurantDocument } from "@/types/restaurant";

function DishCard({
  dish,
  res,
}: {
  dish: ItemType;
  res: RestaurantDocument;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const resName = locale === "ar" ? res.profile?.nameInAr : res.profile?.name;
  const minSizePrice =
    dish.sizes && dish.sizes.length > 0
      ? Math.min(...dish.sizes.map((s) => Number(s.price) || 0))
      : null;
  const price = minSizePrice ?? dish.price;

  return (
    <Link
      href={`/${res.profile.name.split(" ").join("-")}`}
      className="group flex items-center gap-3 rounded-2xl border border-color-7 bg-white p-3 transition-all hover:border-color-2/40 hover:shadow-md"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-color-7">
        {dish.backgrounds?.[0] && (
          <img
            src={dish.backgrounds[0]}
            alt={dish.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-ProximaNovaSemiBold text-color-1">
          {dish.title}
        </h4>
        <p className="mt-0.5 truncate text-xs font-ProximaNovaThin text-color-5">
          {resName}
        </p>
        <p className="egp mt-1 font-ProximaNovaSemiBold text-sm text-color-11">
          {price}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-color-7 px-2.5 py-1 text-[11px] font-ProximaNovaSemiBold text-color-6">
        {t("Popular")}
      </span>
    </Link>
  );
}

function RestaurantDishes({ res }: { res: RestaurantDocument }) {
  const locale = useLocale();
  const { data } = useFetchMenuDataQuery(res.accessToken);

  if (!data) return null;

  const menu = data as unknown as MainMenuType;
  const visible = (menu?.items || []).filter((item) => item.visibility);
  const dishes = visible.filter((item) => item.topMenu).slice(0, 4);

  if (dishes.length === 0) {
    dishes.push(
      ...visible
        .slice()
        .sort(
          (a, b) =>
            Number(Boolean(b.discount)) - Number(Boolean(a.discount))
        )
        .slice(0, 4)
    );
  }

  if (dishes.length === 0) return null;

  const resName = locale === "ar" ? res.profile?.nameInAr : res.profile?.name;

  return (
    <div className="space-y-3">
      <Link
        href={`/${res.profile.name.split(" ").join("-")}`}
        className="flex items-center gap-2 font-ProximaNovaSemiBold text-color-1 transition-colors hover:text-color-2"
      >
        {res.branding?.icon && (
          <img
            src={res.branding.icon}
            alt=""
            loading="lazy"
            className="size-6 rounded-md object-cover ring-1 ring-color-7"
          />
        )}
        <span className="truncate">{resName}</span>
      </Link>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} res={res} />
        ))}
      </div>
    </div>
  );
}

function PopularDishes({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();

  const featured = restaurants
    .filter((r) => r.status !== "hidden")
    .slice()
    .sort(
      (a, b) =>
        Number(b.reviewSummary?.averageRating ?? 0) -
        Number(a.reviewSummary?.averageRating ?? 0)
    )
    .slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <>
      <div className="divider"></div>
      <section id="popular-dishes">
        <SectionHeader
          title={t("Popular dishes")}
          subtitle={t("Popular dishes subtitle")}
        />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {featured.map((res) => (
            <RestaurantDishes key={res.accessToken} res={res} />
          ))}
        </div>
      </section>
    </>
  );
}

export default PopularDishes;
