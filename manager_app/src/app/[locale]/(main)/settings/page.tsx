"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import { setTheme, selectTheme } from "@/lib/rtk/slices/toggleSlice";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/dashboard/app-header";
import { Settings, Sun, Moon } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const toggleTheme = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"));
  };

  const switchLanguage = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<Settings className="w-5 h-5" />}
      />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="font-medium">{t("theme")}</p>
              <p className="text-sm text-muted-foreground">{t("themeDescription")}</p>
            </div>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="font-medium">{t("language")}</p>
              <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentLocale === "ar" ? "default" : "outline"}
                size="sm"
                onClick={() => switchLanguage("ar")}
              >
                العربية
              </Button>
              <Button
                variant={currentLocale === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => switchLanguage("en")}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
