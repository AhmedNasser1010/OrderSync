"use client";

import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export function AccountSetupScreen() {
  const t = useTranslations("accountSetup");

  return (
    <div className="bg-background flex min-h-dvh items-center p-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="bg-card rounded-2xl p-6 text-center shadow-sm">
          <div className="bg-muted mx-auto flex size-16 items-center justify-center rounded-full">
            <Shield className="text-muted-foreground size-8" />
          </div>
          <h2 className="text-foreground mt-6 text-xl font-semibold">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
