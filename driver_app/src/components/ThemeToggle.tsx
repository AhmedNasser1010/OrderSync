"use client";

import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setTheme, selectTheme } from "@/rtk/slices/toggleSlice";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  return (
    <button
      onClick={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
