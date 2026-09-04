"use client";

import { useMemo } from "react";
import {
  Home as HomeIcon,
  ShoppingCartIcon,
  WalletIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAppSelector } from "@/rtk/hooks";
import { cn } from "@/lib/utils";

function HomeBottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const cartItems = useAppSelector((state) => state.cart.items);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.endsWith(`/${""}`) || pathname.endsWith("/ar") || pathname.endsWith("/en");
    }
    return pathname.endsWith(href) || pathname.includes(href);
  };

  const items = useMemo(() => {
    const list = [
      {
        key: "home",
        href: "/",
        label: t("Home"),
        icon: HomeIcon,
        onClick: undefined as (() => void) | undefined,
        badge: 0,
      },
      {
        key: "cart",
        href: "/cart",
        label: t("Cart"),
        icon: ShoppingCartIcon,
        onClick: undefined as (() => void) | undefined,
        badge: cartItems.length,
      },
      {
        key: "wallet",
        href: "/wallet",
        label: t("Wallet"),
        icon: WalletIcon,
        onClick: undefined as (() => void) | undefined,
        badge: 0,
      },
    ];
    return list;
  }, [t, cartItems.length]);

  return (
    <nav
      aria-label={t("Bottom navigation")}
      className="home-bottom-nav fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-1.5 bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg shadow-black/5">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 min-w-0 transition-colors"
            >
              {active && (
                <span className="absolute inset-0 bg-primary/10 rounded-xl -z-0" />
              )}
              <span className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active ? "text-primary scale-110" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 grid min-w-4 min-h-4 place-items-center rounded-full bg-color-2 px-1 text-[9px] font-ProximaNovaBold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200 truncate",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default HomeBottomNav;