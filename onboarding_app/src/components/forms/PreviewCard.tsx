"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PreviewCardProps {
  name: string;
  nameInAr: string;
  cover: string;
  industry: string;
}

export function PreviewCard({
  name,
  nameInAr,
  cover,
  industry,
}: PreviewCardProps) {
  return (
    <Card className="p-6 bg-card border-border overflow-hidden sticky top-32">
      <h2 className="text-lg font-semibold text-foreground mb-4">Preview</h2>

      {/* Cover Image */}
      <div className="relative w-full h-40 bg-secondary/30 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No cover image</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-foreground">
            {name || "Restaurant Name"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {nameInAr || "الاسم بالعربية"}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary" className="capitalize">
            {industry.replace("-", " ")}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          This is how your restaurant will appear to customers in the app.
        </div>
      </div>
    </Card>
  );
}
