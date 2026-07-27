"use client";

import type { MainTabTypes } from "@/types/orders";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { activeTab, setActiveTab } from "@/rtk/slices/toggleSlice";
import { cn } from "@/lib/utils";
import { SquareArrowDown, CookingPot, Bike, MoreHorizontal, CheckCircle, XCircle, Cog } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const mainTabs: { value: MainTabTypes; label: string; icon: React.ElementType }[] = [
  { value: "RECEIVED", label: "Received", icon: SquareArrowDown },
  { value: "PREPARING", label: "Preparing", icon: CookingPot },
  { value: "DELIVERY", label: "Delivery", icon: Bike },
];

const moreTabs: { value: MainTabTypes; label: string; icon: React.ElementType }[] = [
  { value: "COMPLETED", label: "Completed", icon: CheckCircle },
  { value: "VOIDED", label: "Voided", icon: XCircle },
];

export default function OrdersTabs({ counts }: { counts: Record<MainTabTypes, number> }) {
  const dispatch = useAppDispatch();
  const activeTabValue = useAppSelector(activeTab);
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navigateHome = (tab: MainTabTypes) => {
    dispatch(setActiveTab(tab));
    if (!isHome) router.push("/");
  };

  const handleMoreClick = () => {
    if (showMore) {
      setShowMore(false);
      navigateHome("RECEIVED");
    } else {
      setShowMore(true);
    }
  };

  const handleSelectMoreTab = (tab: MainTabTypes) => {
    navigateHome(tab);
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      {/* Secondary dock — Completed, Voided & Settings */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 px-2 py-1 mb-1.5 bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg shadow-black/5 transition-all duration-300",
          showMore
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        {moreTabs.map(({ value, label, icon: Icon }) => {
          const isActive = activeTabValue === value;
          const count = counts[value];

          return (
            <button
              key={value}
              onClick={() => handleSelectMoreTab(value)}
              className="relative flex flex-1 flex-col items-center gap-px py-1.5 min-w-0 transition-colors"
            >
              {isActive && (
                <span className="absolute inset-0 bg-primary/10 rounded-lg -z-0" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 right-1/4 min-w-[16px] h-4 rounded-full px-1 flex items-center justify-center text-[9px] font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => {
            setShowMore(false);
            if (pathname !== "/settings") router.push("/settings");
          }}
          className="relative flex flex-1 flex-col items-center gap-px py-1.5 min-w-0 transition-colors"
        >
          <Cog className={cn(
            "h-4 w-4 transition-all duration-200",
            pathname === "/settings" ? "text-primary scale-110" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-[9px] font-medium transition-colors duration-200",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          )}>
            Settings
          </span>
          {pathname === "/settings" && (
            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Main dock — Received, Preparing, Delivery, More */}
      <div className="flex items-center justify-around px-2 py-1.5 bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg shadow-black/5">
        {mainTabs.map(({ value, label, icon: Icon }) => {
          const isActive = activeTabValue === value;
          const count = counts[value];

          return (
            <button
              key={value}
              onClick={() => {
                setShowMore(false);
                navigateHome(value);
              }}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 min-w-0 transition-colors"
            >
              {isActive && (
                <span className="absolute inset-0 bg-primary/10 rounded-xl -z-0" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 right-1/4 min-w-[18px] h-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}

        <button
          onClick={handleMoreClick}
          className="relative flex flex-1 flex-col items-center gap-0.5 py-2 min-w-0 transition-colors"
        >
          {showMore && (
            <span className="absolute inset-0 bg-primary/10 rounded-xl -z-0" />
          )}
          <MoreHorizontal
            className={cn(
              "w-5 h-5 transition-all duration-200",
              showMore ? "text-primary scale-110" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-[10px] font-medium transition-colors duration-200",
              showMore ? "text-primary" : "text-muted-foreground"
            )}
          >
            More
          </span>
          {showMore && (
            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>
      </div>
    </nav>
  );
}
