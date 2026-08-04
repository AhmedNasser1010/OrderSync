"use client";

import { Bike, MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import OpenBadge from "@/components/Home/OpenBadge";
import type { RestaurantDocument } from "@/types/restaurant";

const BreadcrumbArrow = () => (
  <svg
    className="rtl:rotate-180 h-3 w-3 text-white/70"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 6 10"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m1 9 4-4-4-4"
    />
  </svg>
);

const RestaurantHero = ({
  res,
  resMainInfo,
}: {
  res: RestaurantDocument;
  resMainInfo: {
    city: string;
    name?: string;
    cuisines?: string[];
    areaName: string;
    sla: string;
  };
}) => {
  const t = useTranslations();
  const { city, name, cuisines, areaName, sla } = resMainInfo;
  const rating = Number(res?.reviewSummary?.averageRating);
  const totalReviews = Number(res?.reviewSummary?.totalReviews) || 0;
  const ratingLabel = Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : null;
  const ratingsLabel =
    totalReviews > 0
      ? `${totalReviews > 999 ? `${(totalReviews / 1000).toFixed(1)}k` : totalReviews} ${t("ratings")}`
      : null;

  return (
    <div className="relative overflow-hidden bg-[#282c3f]">
      <div className="relative mx-auto w-full max-w-5xl px-4 pt-24 sm:px-7">
        <nav aria-label="Breadcrumb" className="relative z-10">
          <ol className="inline-flex items-center gap-1.5">
            <li>
              <Link href="/" className="text-xs font-ProximaNovaMed text-white/80 hover:text-white">
                {t("Home")}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <BreadcrumbArrow />
              <Link href="/" className="text-xs font-ProximaNovaMed text-white/80 hover:text-white">
                {city}
              </Link>
            </li>
            <li aria-current="page" className="flex items-center gap-1.5">
              <BreadcrumbArrow />
              <span className="truncate text-xs font-ProximaNovaMed text-white/95">{name}</span>
            </li>
          </ol>
        </nav>

        <div className="relative z-10 flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            {res?.branding?.icon && (
              <img
                src={res.branding.icon}
                alt={name || "restaurant"}
                loading="lazy"
                className="size-16 shrink-0 rounded-2xl object-cover shadow-lg ring-2 ring-white/30 sm:size-20"
              />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-GrotBlack text-3xl text-white sm:text-4xl">
                  {name}
                </h1>
                <OpenBadge
                  status={res?.status}
                  openingHours={res?.operations?.openingHours}
                  openNowUntil={res?.operations?.openNowUntil}
                />
              </div>
              {cuisines?.length ? (
                <p className="mt-1.5 font-ProximaNovaMed text-sm text-white/80">
                  {cuisines.join(", ")}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-white/60" />
                  {areaName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Bike className="size-4 text-white/60" />
                  {sla}
                </span>
              </div>
              {res?.branding?.promotionalSubtitle && (
                <p className="mt-3 w-fit rounded-full bg-color-2/90 px-3 py-1 text-xs font-ProximaNovaSemiBold text-white">
                  {res.branding.promotionalSubtitle}
                </p>
              )}
            </div>
          </div>

          {ratingLabel && (
            <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm">
              <span className="grid size-9 place-items-center rounded-lg bg-color-11 text-white">
                <Star className="size-5 fill-current" />
              </span>
              <div>
                <p className="font-ProximaNovaBold text-lg leading-none text-white" dir="ltr">
                  {ratingLabel}
                </p>
                {ratingsLabel && (
                  <p className="mt-1 text-xs font-ProximaNovaMed text-white/75">
                    {ratingsLabel}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {res?.branding?.cover && (
        <img
          src={res.branding.cover}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#282c3f] via-[#282c3f]/80 to-[#282c3f]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#282c3f]/40 to-[#fc8019]/10" />
    </div>
  );
};

export default RestaurantHero;
