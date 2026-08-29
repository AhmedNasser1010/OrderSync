"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BannerPreviewDraft {
  imageUrl: string;
  href: string;
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

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className={cn("overflow-hidden", className)}
    >
      <div className="relative h-55 w-full overflow-hidden rounded-3xl bg-secondary sm:h-52">
        {data.imageUrl ? (
          <Image
            src={data.imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No image URL provided
          </div>
        )}
      </div>
    </div>
  );
}
