"use client";

import { cn } from "@/lib/utils";

interface MapButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label: string;
  status?: "active" | "normal" | "disabled" | "";
}

function MapButton({
  onClick,
  style,
  startIcon,
  endIcon,
  label,
  status = "",
}: MapButtonProps) {
  const isDisabled = status === "disabled";

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onClick?.()}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-[5px] border p-2.5 text-sm outline-none",
        status === "active"
          ? "border-[#434343] bg-color-11 text-white"
          : "border-input bg-card"
      )}
    >
      {startIcon}
      {label}
      {endIcon}
    </button>
  );
}

export default MapButton;
