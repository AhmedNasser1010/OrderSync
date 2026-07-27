"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Package, Store } from "lucide-react";
import { useMarketplaceOrders, useMyOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/orders/active", label: "My Orders", icon: Package },
  { href: "/orders/marketplace", label: "Marketplace", icon: Store },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { orders: myOrders } = useMyOrders();
  const { orders: marketplaceOrders } = useMarketplaceOrders();
  const activeTab = pathname.startsWith("/orders/marketplace")
    ? "/orders/marketplace"
    : "/orders/active";

  const hasNoActiveOrders = myOrders.length === 0;
  const hasMarketplaceOrders = marketplaceOrders.length > 0;
  const shouldFlashMarketplace = hasNoActiveOrders && hasMarketplaceOrders;

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2">
      <div className="flex items-center justify-around rounded-2xl border border-border/50 bg-background/80 px-2 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-card/80">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.href;
          const isMarketplaceTab = tab.href === "/orders/marketplace";
          const count =
            tab.href === "/orders/active" ? myOrders.length : marketplaceOrders.length;
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                isMarketplaceTab && shouldFlashMarketplace && "animate-tab-flash",
              )}
            >
              {isActive && (
                <span className="absolute inset-0 -z-0 rounded-xl bg-primary/10" />
              )}
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 right-1/4 min-w-[18px] h-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
              <tab.icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110",
                )}
              />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
