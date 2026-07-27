"use client";

import { useEffect } from "react";

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
    root.classList.add("font-sans", fontClass);
  }, [locale, fontClass]);

  return null;
}
