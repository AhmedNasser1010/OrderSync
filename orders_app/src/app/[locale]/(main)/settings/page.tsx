"use client";

import { useTranslations } from "next-intl";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import ProfileAndLang from "@/app/settings/ProfileAndLang";
import DisplaySettings from "@/app/settings/DisplaySettings";
import OrderWorkflow from "@/app/settings/OrderWorkflow";
import Themes from "@/app/settings/Themes";
import CloseDay from "@/app/settings/CloseDay";

export default function SettingsPage() {
  const t = useTranslations("Settings.logout");
  const { logout } = useAuth();

  return (
    <div className="px-4 pb-40 pt-6 max-w-2xl mx-auto space-y-6">
      <CloseDay />
      <ProfileAndLang />
      <DisplaySettings />
      <OrderWorkflow />
      <Themes />

      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-500 shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
            <p className="text-xs text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <div className="px-4 pb-4 pt-2">
          <Button
            variant="outline"
            className="w-full justify-between border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
            onClick={logout}
          >
            <span>{t("button")}</span>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
