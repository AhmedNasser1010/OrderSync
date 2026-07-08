"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import AutoLoginLoadingScreen from "@/components/AutoLoginLoadingScreen";
import { Button } from "@/components/ui/button";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthLoading, logout } = useAuth(false);
  const { user: userData, isLoading: isUserDataLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  }, [logout]);

  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  // Redirect unauthenticated users to login on protected pages
  useEffect(() => {
    if (!user?.uid && !isAuthLoading && !isAuthPage) {
      router.push("/login");
    }
  }, [user?.uid, isAuthLoading, isAuthPage, router]);

  // Show loading screen while auth is loading
  if (!user?.uid && isAuthLoading) {
    return <AutoLoginLoadingScreen />;
  }

  // If user is not logged in on a protected page, show loading while redirecting
  if (!user?.uid) {
    if (isAuthPage) {
      return <>{children}</>;
    }
    return <AutoLoginLoadingScreen />;
  }

  // Show loading while user data is being fetched from Firestore
  if (isUserDataLoading && !userData) {
    return <AutoLoginLoadingScreen />;
  }

  // If user data is loaded but accessToken is empty/missing or role is not BUSINESS_MANAGER, show restricted dialog
  const accessToken = userData?.accessToken;
  const userRole = userData?.userInfo?.role;
  const isUnassigned = !accessToken || accessToken.trim() === "" || userRole !== "BUSINESS_MANAGER";

  if (isUnassigned) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg mx-4 max-w-md w-full">
          <h2 className="text-lg font-semibold text-foreground text-center">
            Access Restricted
          </h2>
          <p className="text-sm text-muted-foreground text-center pt-2">
            You aren't assigned to any businesses yet
            <br />
            Signed in as <strong>{user.email || "unknown@email.com"}</strong>
          </p>
          <div className="flex items-center justify-center mt-6 pt-4 border-t border-border">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full sm:w-auto"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
