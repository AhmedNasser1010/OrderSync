"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { Settings2 } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import useUser from "@/hooks/useUser";
import { useTranslations } from "next-intl";

export function UserMenu() {
  const t = useTranslations("userMenu");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { name } = useUser();

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full transition-transform active:scale-95"
      >
        <UserAvatar name={name} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-1 shadow-xl shadow-black/10 backdrop-blur-xl"
        >
          <Link
            href="/orders/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            {t("settings")}
          </Link>
        </div>
      )}
    </div>
  );
}
