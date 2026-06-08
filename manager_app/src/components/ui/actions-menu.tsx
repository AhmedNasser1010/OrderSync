"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

type MenuItem = {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
};

interface ActionsMenuProps {
  items: MenuItem[];
  className?: string;
}

export function ActionsMenu({ items, className = "" }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-md transition-colors bg-muted text-muted-foreground hover:bg-muted/80"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
          <div role="menu" className="flex flex-col py-1">
            {items.map((it) => (
              <button
                key={it.key}
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center gap-2 ${
                  it.destructive ? "text-destructive" : "text-foreground"
                }`}
                role="menuitem"
              >
                {it.icon}
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
