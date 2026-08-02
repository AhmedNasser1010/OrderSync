"use client";

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
}: {
  name?: string;
  photoUrl?: string;
  className?: string;
}) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative size-14 shrink-0 grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-color-2 to-[#ffab4a] text-white font-ProximaNovaBold text-lg shadow-md shadow-color-2/30 ring-2 ring-white",
        className
      )}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name || "avatar"}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

export default ProfileAvatar;
