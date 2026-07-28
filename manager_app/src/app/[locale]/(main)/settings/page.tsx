"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import { setTheme, selectTheme } from "@/lib/rtk/slices/toggleSlice";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AppHeader } from "@/components/dashboard/app-header";
import { Settings, Sun, Moon, LogOut, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const toggleTheme = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"));
  };

  const switchLanguage = (locale: string) => {
    router.replace(pathname, { locale });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
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

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="font-medium">{t("logout")}</p>
              <p className="text-sm text-muted-foreground">{t("logoutDescription")}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </Button>
          </div>
        </div>
      </main>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("logout")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("logoutConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
