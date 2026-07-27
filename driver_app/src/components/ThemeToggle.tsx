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
      className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
