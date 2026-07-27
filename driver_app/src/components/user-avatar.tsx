"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  name?: string | null;
}

export function UserAvatar({ className, name }: UserAvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-sm font-semibold text-card-foreground shadow-sm",
        className,
      )}
      aria-label={name ? `Signed in as ${name}` : "Signed in user"}
      title={name || "User"}
    >
      <span>{initial}</span>
    </div>
  );
}
