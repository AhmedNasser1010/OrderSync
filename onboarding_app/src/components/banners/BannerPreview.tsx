"use client";

import { cn } from "@/lib/utils";

export interface BannerPreviewDraft {
  imageUrl: string;
  cta: {
    labelEn: string;
    labelAr: string;
    href: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  ctaPositionX?: number;
  ctaPositionY?: number;
  ctaPositionCorner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

interface BannerPreviewProps {
  data: BannerPreviewDraft;
  lang?: "en" | "ar";
  className?: string;
}

export function BannerPreview({
  data,
  lang = "en",
  className,
}: BannerPreviewProps) {
  const isAr = lang === "ar";
  const ctaLabel = isAr ? data.cta.labelAr : data.cta.labelEn;
  const hasCta = Boolean(ctaLabel && data.cta.href);

  const posX = data.ctaPositionX ?? 16;
  const posY = data.ctaPositionY ?? 16;
  const corner = data.ctaPositionCorner ?? "top-left";

  const buttonStyle = {
    backgroundColor: data.cta.backgroundColor || "#fc8019",
    color: data.cta.textColor || "#ffffff",
    borderColor: data.cta.borderColor || undefined,
    borderWidth: data.cta.borderWidth ? `${data.cta.borderWidth}px` : undefined,
    borderStyle: data.cta.borderWidth ? ("solid" as const) : undefined,
    borderRadius:
      data.cta.borderRadius !== undefined
        ? `${data.cta.borderRadius}px`
        : "9999px",
    fontFamily: data.cta.fontFamily || undefined,
    fontSize: data.cta.fontSize ? `${data.cta.fontSize}px` : undefined,
    fontWeight: data.cta.fontWeight || "600",
  };

  const positionStyle: Record<string, string> = {};
  if (corner === "top-left") {
    positionStyle.left = `${posX}px`;
    positionStyle.top = `${posY}px`;
  } else if (corner === "top-right") {
    positionStyle.right = `${posX}px`;
    positionStyle.top = `${posY}px`;
  } else if (corner === "bottom-left") {
    positionStyle.left = `${posX}px`;
    positionStyle.bottom = `${posY}px`;
  } else {
    positionStyle.right = `${posX}px`;
    positionStyle.bottom = `${posY}px`;
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className={cn("overflow-hidden", className)}
    >
      <div className="relative h-55 w-full overflow-hidden rounded-3xl bg-secondary sm:h-52">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No image URL provided
          </div>
        )}
        {hasCta && (
          <div className="absolute" style={positionStyle}>
            <span
              className="mt-2 flex items-center gap-2 px-5 py-2.5 shadow-lg cursor-default"
              style={buttonStyle}
            >
              {ctaLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
