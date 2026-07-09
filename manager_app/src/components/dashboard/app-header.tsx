"use client";

import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import { setTheme, selectTheme } from "@/lib/rtk/slices/toggleSlice";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function AppHeader({ title, subtitle, icon, children }: AppHeaderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {children}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                dispatch(setTheme(theme === "dark" ? "light" : "dark"))
              }
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
