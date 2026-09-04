"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SearchX } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/rtk/hooks";
import { useFetchAllMenusQuery } from "@/rtk/api/firestoreApi";
import type { RestaurantDocument } from "@/types/restaurant";
import type { ItemType, MainMenuType } from "@ordersync/types";

const MAX_RESULTS = 6;

interface DishResult {
  dish: ItemType;
  restaurant: RestaurantDocument;
  slug: string;
}

function RestaurantSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const restaurants = useAppSelector((state) => state.restaurants);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const normalized = query.trim().toLowerCase();
  const shouldFetch = open && normalized.length > 0;

  const ids = useMemo(
    () => restaurants.map((r: RestaurantDocument) => r.accessToken),
    [restaurants]
  );

  const { data: allMenus } = useFetchAllMenusQuery(ids, {
    skip: !shouldFetch || ids.length === 0,
  });

  const restaurantResults = useMemo(() => {
    if (!normalized) return [];
    return restaurants
      .filter(
        (res: RestaurantDocument) =>
          res.profile.name?.toLowerCase().includes(normalized) ||
          res.profile.nameInAr?.toLowerCase().includes(normalized)
      )
      .slice(0, MAX_RESULTS);
  }, [restaurants, normalized]);

  const dishResults = useMemo<DishResult[]>(() => {
    if (!normalized || !allMenus) return [];
    const results: DishResult[] = [];
    for (const res of restaurants) {
      const menu = allMenus[res.accessToken] as MainMenuType | undefined;
      if (!menu?.items) continue;
      for (const item of menu.items) {
        if (!item.visibility) continue;
        const matchesTitle = item.title?.toLowerCase().includes(normalized);
        const matchesDesc = item.description?.toLowerCase().includes(normalized);
        if (matchesTitle || matchesDesc) {
          const slug = res.profile.name.split(" ").join("-");
          results.push({ dish: item, restaurant: res, slug });
        }
      }
      if (results.length >= MAX_RESULTS) break;
    }
    return results.slice(0, MAX_RESULTS);
  }, [restaurants, allMenus, normalized]);

  const showDropdown = open && normalized.length > 0;
  const hasResults = restaurantResults.length > 0 || dishResults.length > 0;

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
          className="w-40 min-w-0 flex-1 bg-transparent py-0.5 text-center text-sm font-ProximaNovaMed text-color-1 placeholder:text-color-5 outline-none sm:w-48"
        />
      </div>

      {showDropdown && (
        <div className="absolute start-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-color-7 bg-card py-1.5 shadow-xl">
          {hasResults ? (
            <>
              {restaurantResults.length > 0 && (
                <>
                  {restaurantResults.map((res: RestaurantDocument) => {
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
                  })}
                </>
              )}
              {dishResults.length > 0 && (
                <>
                  {restaurantResults.length > 0 && (
                    <div className="mx-3 border-t border-color-7" />
                  )}
                  {dishResults.map(({ dish, restaurant, slug }) => {
                    const resName =
                      locale === "ar"
                        ? restaurant.profile.nameInAr || restaurant.profile.name
                        : restaurant.profile.name;
                    return (
                      <Link
                        key={`${restaurant.accessToken}-${dish.id}`}
                        href={`/${slug}`}
                        onClick={() => {
                          setQuery("");
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-color-7/40"
                      >
                        {dish.backgrounds?.[0] && (
                          <Image
                            src={dish.backgrounds[0]}
                            alt={dish.title}
                            width={36}
                            height={36}
                            className="size-9 shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-ProximaNovaSemiBold text-color-1">
                            {dish.title}
                          </span>
                          <span className="block truncate text-xs text-color-5">
                            {resName}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
            </>
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
