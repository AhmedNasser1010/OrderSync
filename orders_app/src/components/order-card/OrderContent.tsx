"use client";

import { useTranslations, useLocale } from "next-intl";
import { CardContent } from "@/components/ui/card";

export default function OrderContent({
  total,
  customer,
  items,
}: {
  total: string;
  customer: string;
  items: string;
}) {
  const ct = useTranslations("Common");
  const locale = useLocale();

  return (
    <CardContent className="px-4 py-2">
      <div className="text-xl font-bold">
        {locale === "ar" ? `${total} ${ct("currency")}` : `${ct("currency")}${total}`}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{customer}</p>
      <p className="text-sm mt-1.5 line-clamp-2 text-foreground/80">{items}</p>
    </CardContent>
  );
}
