"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
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
import { MoonStar, LogOut, Loader2, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleToggle } from "@/components/LocaleToggle";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
    <div className="p-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MoonStar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("theme")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("themeDesc")}
              </p>
            </div>

            <ThemeToggle />
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("language")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("languageDesc")}
              </p>
            </div>

            <LocaleToggle />
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("logout")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("logoutDesc")}
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </Button>
          </div>
        </Card>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("logoutConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("logoutConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              {t("logout")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
