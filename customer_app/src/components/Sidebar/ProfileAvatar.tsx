"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

function getInitials(name?: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return (first + last).toUpperCase();
}

function ProfileAvatar({
  name,
  photoUrl,
  className,
  size = "md",
}: {
  name?: string;
  photoUrl?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const initials = getInitials(name);
  const sizeClass =
    size === "sm"
      ? "size-8 rounded-full text-xs"
      : "size-14 rounded-2xl text-lg";

  return (
    <div
      className={cn(
        "relative shrink-0 grid place-items-center overflow-hidden bg-gradient-to-br from-color-2 to-[#ffab4a] text-white font-ProximaNovaBold shadow-md shadow-color-2/30 ring-2 ring-white",
        sizeClass,
        className
      )}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name || "avatar"}
          referrerPolicy="no-referrer"
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

export default ProfileAvatar;
