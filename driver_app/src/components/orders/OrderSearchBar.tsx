"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type OrderSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function OrderSearchBar({
  value,
  onChange,
  placeholder,
}: OrderSearchBarProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm backdrop-blur-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              onChange("");
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          inputMode="search"
          className={cn(
            "h-11 rounded-xl border-border/60 bg-background/80 ps-9 pe-3 text-sm shadow-none focus-visible:bg-background",
            "placeholder:text-muted-foreground/80",
          )}
        />
      </div>
    </div>
  );
}
