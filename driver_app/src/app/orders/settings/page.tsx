"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { MoonStar } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-[0.18em]">
            Appearance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Control how the driver app looks on this device.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MoonStar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Theme
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Switch between light and dark mode.
              </p>
            </div>

            <ThemeToggle />
          </div>
        </Card>
      </div>
    </div>
  );
}
