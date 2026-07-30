"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

type OrderSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function OrderSearchBar({
  value,
  onChange,
  placeholder,
}: OrderSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        if (value) onChange("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, value, onChange]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (value) onChange("");
  }, [value, onChange]);

  return (
    <div ref={containerRef} className="fixed top-16 start-4 z-[1000]">
      {isOpen ? (
        <div className="rounded-2xl border border-border/50 bg-background/80 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={handleClose}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
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
