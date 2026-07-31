"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoaderCircle } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AccountSetupScreen } from "@/components/approval/AccountSetupScreen";
import { LocationTracker } from "@/components/LocationTracker";
import { NotificationTracker } from "@/components/NotificationTracker";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
};

export function AuthGuard({ children }: Props) {
  const { isOnboarded, user, isInitializing } = useAuth();
  const pathname = usePathname();

  const isAuthPage = /^\/[a-z]{2}\/auth\//.test(pathname) || pathname.startsWith("/auth/");

  if (isInitializing) {
    return (
      <div className="bg-background flex min-h-dvh items-center p-4">
        <div className="mx-auto flex w-full max-w-sm flex-col items-center">
          <LoaderCircle className="text-muted-foreground size-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user) {
    return <AuthForm mode="signin" />;
  }

  if (!isOnboarded) {
    return <AccountSetupScreen />;
  }

  return (
    <LocationTracker>
      <NotificationTracker>
        {children}
      </NotificationTracker>
    </LocationTracker>
  );
}
