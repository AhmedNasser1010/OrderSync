"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import CarouselArrows from "@/components/Home/CarouselArrows";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  arrows?: boolean;
  onLeft?: () => void;
  onRight?: () => void;
  className?: string;
  titleClassName?: string;
}

function SectionHeader({
  title,
  subtitle,
  action,
  arrows = false,
  onLeft,
  onRight,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 pt-5 pb-5",
        className
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            "font-GrotBlack text-2xl tracking-tight text-color-1",
            titleClassName
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="font-GrotThin text-color-5 text-base mt-1">{subtitle}</p>
        )}
      </div>
      {arrows && onLeft && onRight && (
        <CarouselArrows onLeft={onLeft} onRight={onRight} className="shrink-0" />
      )}
      {action}
    </div>
  );
}

export default SectionHeader;
