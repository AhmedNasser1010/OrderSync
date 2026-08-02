"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { StarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import SectionHeader from "@/components/Home/SectionHeader";
import type { RestaurantDocument } from "@/types/restaurant";

const STAR_KEYS = [5, 4, 3, 2, 1] as const;

function Reviews({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();
  const locale = useLocale();

  const best = useMemo(() => {
    return restaurants
      .filter((r) => (r.reviewSummary?.totalReviews || 0) > 0)
      .sort(
        (a, b) =>
          (b.reviewSummary?.totalReviews || 0) -
          (a.reviewSummary?.totalReviews || 0)
      )[0];
  }, [restaurants]);

  if (!best) return null;

  const summary = best.reviewSummary;
  const avg = Number(summary?.averageRating || 0);
  const total = summary?.totalReviews || 0;
  const maxCount = Math.max(
    1,
    ...STAR_KEYS.map((k) => summary?.stars?.[k] || 0)
  );
  const resName = locale === "ar" ? best.profile?.nameInAr : best.profile?.name;

  return (
    <>
      <div className="divider"></div>
      <section id="reviews">
        <SectionHeader
          title={t("Loved by our customers")}
          subtitle={t("Reviews subtitle")}
        />
        <div className="flex flex-col items-center gap-8 rounded-3xl border border-color-7 bg-white p-8 shadow-sm sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:w-52 shrink-0">
            <span className="grid size-20 place-items-center rounded-full bg-color-11 text-white">
              <span className="flex items-center gap-1.5 font-ProximaNovaBold text-2xl">
                <StarIcon className="size-5 fill-current" />
                {avg.toFixed(1)}
              </span>
            </span>
            <span className="text-sm font-ProximaNovaSemiBold text-color-1">
              {resName}
            </span>
            <span className="text-xs font-ProximaNovaThin text-color-5">
              {total} {t("ratings")}
            </span>
          </div>

          <div className="w-full flex-1 space-y-2.5">
            {STAR_KEYS.map((star) => {
              const count = summary?.stars?.[star] || 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-3 text-sm text-color-6"
                >
                  <span className="flex w-8 items-center justify-end gap-1 font-ProximaNovaMed">
                    {star} <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-color-7">
                    <div
                      className="h-full rounded-full bg-color-11"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 font-ProximaNovaMed">{count}</span>
                </div>
              );
            })}
          </div>

          <Link
            href={`/${best.profile.name.split(" ").join("-")}`}
            className="shrink-0 rounded-full bg-color-2 px-6 py-3 text-sm font-ProximaNovaSemiBold text-white transition-all hover:bg-color-2/90 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
          >
            {t("Rate this Restaurant!")}
          </Link>
        </div>
      </section>
    </>
  );
}

export default Reviews;
