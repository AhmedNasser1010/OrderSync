"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, SearchX } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAppSelector } from "@/rtk/hooks";
import type { RestaurantDocument } from "@/types/restaurant";

const MAX_RESULTS = 6;

function RestaurantSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const restaurants = useAppSelector((state) => state.restaurants);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const normalized = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalized) return [];
    return restaurants
      .filter(
        (res: RestaurantDocument) =>
          res.profile.name?.toLowerCase().includes(normalized) ||
          res.profile.nameInAr?.toLowerCase().includes(normalized)
      )
      .slice(0, MAX_RESULTS);
  }, [restaurants, normalized]);

  const showDropdown = open && normalized.length > 0;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1">
      <div className="group flex items-center gap-2.5 rounded-full border border-color-7 bg-card py-3 ps-4 pe-3 shadow-sm transition-all hover:border-color-2/40 hover:shadow-md focus-within:ring-2 focus-within:ring-color-2/50 outline-none">
        <Search className="size-4 shrink-0 text-color-5" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("Search restaurants")}
          aria-label={t("Search restaurants")}
          className="w-40 min-w-0 flex-1 bg-transparent py-0.5 text-sm font-ProximaNovaMed text-color-1 placeholder:text-color-5 outline-none sm:w-48"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("Clear search")}
            className="grid size-5 shrink-0 place-items-center rounded-full bg-color-5 text-white cursor-pointer"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute end-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-color-7 bg-card py-1.5 shadow-xl">
          {results.length ? (
            results.map((res: RestaurantDocument) => {
              const name =
                locale === "ar"
                  ? res.profile.nameInAr || res.profile.name
                  : res.profile.name;
              return (
                <Link
                  key={res.accessToken}
                  href={`/${res.profile.name.split(" ").join("-")}`}
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-color-7/40"
                >
                  {res.branding?.icon && (
                    <Image
                      src={res.branding.icon}
                      alt={name}
                      width={36}
                      height={36}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-ProximaNovaSemiBold text-color-1">
                    {name}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-3">
              <SearchX className="size-4 shrink-0 text-color-5" />
              <p className="font-ProximaNovaMed text-sm text-color-6">
                {t("No restaurants found")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RestaurantSearch;
