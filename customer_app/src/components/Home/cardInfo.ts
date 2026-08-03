import type { RestaurantDocument } from "@/types/restaurant";

export function toCardInfo(
  res: RestaurantDocument,
  t: (key: string) => string
) {
  return {
    areaName: t("El-Ayat"),
    name: res?.profile?.name,
    nameInAr: res?.profile?.nameInAr || res?.profile?.name,
    avgRating: res?.reviewSummary?.averageRating ?? 4.5,
    totalRatings: res?.reviewSummary?.totalReviews ?? 0,
    cloudinaryImageId: res?.branding?.cover,
    icon: res?.branding?.icon,
    sla: `${res.operations.cookTime[0]}-${res.operations.cookTime[1]} ${t("min")}`,
    cuisines: res?.profile?.cuisines,
    status: res?.status,
    promotionalSubtitle: res?.branding?.promotionalSubtitle,
    openingHours: res?.operations?.openingHours,
  };
}
