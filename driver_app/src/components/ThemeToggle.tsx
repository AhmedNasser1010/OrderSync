"use client";

import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setTheme, selectTheme } from "@/rtk/slices/toggleSlice";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const { user } = useAuth();

  const handleToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    const previous = theme;
    dispatch(setTheme(next));
    if (user?.uid) {
      updateDoc(doc(db, "drivers", user.uid), { theme: next }).catch(() => {
        dispatch(setTheme(previous));
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
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
