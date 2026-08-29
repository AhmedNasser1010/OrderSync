"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, X, Store, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBusinessNamesMap } from "@/contexts/BusinessNamesContext";
import type { OrderType } from "@ordersync/types";

interface MapSearchProps {
  allOrders: OrderType[];
  onSelectOrder: (order: OrderType) => void;
  onSelectRestaurant: (name: string, latlng: [number, number]) => void;
}

interface RestaurantResult {
  type: "restaurant";
  id: string;
  name: string;
  address?: string;
  latlng: [number, number];
  orderCount: number;
}

interface OrderResult {
  type: "order";
  order: OrderType;
}

type SearchResult = RestaurantResult | OrderResult;

export function MapSearch({
  allOrders,
  onSelectOrder,
  onSelectRestaurant,
}: MapSearchProps) {
  const t = useTranslations("mapPage");
  const businessNamesMap = useBusinessNamesMap();
  const [isOpen, setIsOpen] = useState(false);

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const results = useMemo<SearchResult[]>(() => {
    const raw = query.trim();
    if (!raw) return [];

    const stripTashkeel = (s: string) =>
      s.replace(/[\u064B-\u065F\u0670]/g, "");
    const normalize = (s: string) =>
      stripTashkeel(s.normalize("NFKC")).toLowerCase();
    const q = normalize(raw);

    const restaurantMap = new Map<
      string,
      { name: string; nameAr: string; address?: string; latlng: [number, number]; count: number }
    >();
    const matchedOrders: OrderResult[] = [];

    const qTokens = q.split(/\s+/).filter(Boolean);

    for (const order of allOrders) {
      const busId = order.business?.id;
      const busName = order.business?.name ?? "";
      const busNameAr = busId ? (businessNamesMap[busId] ?? busName) : busName;
      const busNameOrder = order.business?.nameInAr ?? "";
      const busAddress = order.business?.address;
      const busLL = order.business?.latlng;

      if (busId && busLL && busLL[0] && busLL[1]) {
        if (!restaurantMap.has(busId)) {
          restaurantMap.set(busId, {
            name: busName,
            nameAr: busNameAr || busNameOrder || busName,
            address: busAddress,
            latlng: busLL,
            count: 0,
          });
        }
        restaurantMap.get(busId)!.count++;
      }

      const haystack = [
        busName,
        busNameAr,
        busNameOrder,
        busAddress ?? "",
        order.customer?.name ?? "",
        order.delivery?.address ?? "",
        `#${order.orderNumber}`,
        order.orderNumber.toString(),
        order.id,
        order.cart
          ?.map((i) => `${i.name} ${i.selectedSize}`)
          .join(" "),
      ]
        .join(" ");

      const nHaystack = normalize(haystack);
      if (qTokens.every((tok) => nHaystack.includes(tok))) {
        matchedOrders.push({ type: "order", order });
      }
    }

    const matchedRestaurants: RestaurantResult[] = [];
    for (const [id, r] of restaurantMap) {
      const rHaystack = normalize(`${r.name} ${r.nameAr} ${r.address ?? ""}`);
      if (qTokens.every((tok) => rHaystack.includes(tok))) {
        matchedRestaurants.push({
          type: "restaurant",
          id,
          name: r.nameAr,
          address: r.address,
          latlng: r.latlng,
          orderCount: r.count,
        });
      }
    }

    return [...matchedRestaurants, ...matchedOrders].slice(0, 10);
  }, [query, allOrders, businessNamesMap]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === "restaurant") {
        onSelectRestaurant(result.name, result.latlng);
      } else {
        onSelectOrder(result.order);
      }
      setIsOpen(false);
      setQuery("");
    },
    [onSelectOrder, onSelectRestaurant],
  );

  return (
    <div ref={containerRef} className="fixed top-16 start-4 z-[1000]">
      {isOpen ? (
        <div className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border/50 bg-background/80 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          {query.trim() && (
            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  {t("noResultsFound")}
                </p>
              ) : (
                results.map((result) =>
                  result.type === "restaurant" ? (
                    <button
                      key={`r-${result.id}`}
                      type="button"
                      onClick={() => handleSelect(result)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {result.name}
                        </p>
                        {result.address && (
                          <p className="truncate text-xs text-muted-foreground">
                            {result.address}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t("countOrders", { count: result.orderCount })}
                      </span>
                    </button>
                  ) : (
                    <button
                      key={`o-${result.order.id}`}
                      type="button"
                      onClick={() => handleSelect(result)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold tabular-nums">
                            #{result.order.orderNumber}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {result.order.customer?.name}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.order.business?.name} ·{" "}
                          {result.order.delivery?.address}
                        </p>
                      </div>
                    </button>
                  ),
                )
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/50 bg-background/80 shadow-lg backdrop-blur-xl transition-colors hover:bg-muted active:scale-[0.95]"
        >
          <Search className="h-5 w-5 text-foreground" />
        </button>
      )}
    </div>
  );
}
