"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function HtmlAttributes({
  locale,
  fontClass,
}: {
  locale: string;
  fontClass: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
    root.className = cn("font-sans", fontClass);
  }, [locale, fontClass]);

  return null;
}
