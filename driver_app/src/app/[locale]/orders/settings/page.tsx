"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { MoonStar, LogOut, Loader2, Languages, Bell, Route } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleToggle } from "@/components/LocaleToggle";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import { skipToken } from "@reduxjs/toolkit/query";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, logout } = useAuth();
  const { data: userData } = useFetchUserDataQuery(
    user?.uid ? { uid: user.uid } : skipToken,
  );
  const [notifyPush, setNotifyPush] = useState<boolean | null>(null);
  const [skipStartRoute, setSkipStartRoute] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const notifyPushChecked = notifyPush ?? userData?.notifyPush ?? true;
  const skipStartRouteChecked = skipStartRoute ?? userData?.skipStartRoute ?? true;

  const handleTogglePush = async (enabled: boolean) => {
    if (!user?.uid) return;
    setNotifyPush(enabled);
    try {
      const driverRef = doc(db, "drivers", user.uid);
      await updateDoc(driverRef, { notifyPush: enabled });
    } catch {
      setNotifyPush(null);
    }
  };

  const handleToggleSkipRoute = async (enabled: boolean) => {
    if (!user?.uid) return;
    setSkipStartRoute(enabled);
    try {
      const driverRef = doc(db, "drivers", user.uid);
      await updateDoc(driverRef, { skipStartRoute: enabled });
    } catch {
      setSkipStartRoute(null);
    }
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
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("notifications")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("notificationsDesc")}
              </p>
            </div>

            <Switch
              checked={notifyPushChecked}
              onCheckedChange={handleTogglePush}
            />
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("skipRoute")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("skipRouteDesc")}
              </p>
            </div>

            <Switch
              checked={skipStartRouteChecked}
              onCheckedChange={handleToggleSkipRoute}
            />
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
