"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CategoryType } from "@ordersync/types";

const StickyMenuNav = ({
  categories,
  query,
  onSearchChange,
}: {
  categories: CategoryType[];
  query: string;
  onSearchChange: (q: string) => void;
}) => {
  const t = useTranslations();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (query) return;
    const sections = categories
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace("category-", ""));
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories, query]);

  const handleCategoryClick = (id: string) => {
    setActiveId(id);
    document
      .getElementById(`category-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentActive = query ? null : activeId;

  return (
    <div className="sticky top-14 z-30 border-b border-color-7 bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full items-center gap-3 px-4 py-2.5 2xl:max-w-5xl">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 font-ProximaNovaSemiBold text-sm transition-all cursor-pointer",
                currentActive === category.id
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-color-7 text-color-6 hover:bg-color-7/60"
              )}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-color-5" />
          <input
            type="search"
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("Search menu")}
            aria-label={t("Search menu")}
            className="w-40 rounded-full border border-color-7 bg-color-7/50 py-2 ps-9 pe-8 text-sm font-ProximaNovaMed text-color-1 placeholder:text-color-5 focus:border-color-2/50 focus:bg-background focus:ring-2 focus:ring-color-2/30 outline-none sm:w-56"
          />
          {query && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label={t("Clear search")}
              className="absolute end-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full bg-color-5 text-white cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyMenuNav;
