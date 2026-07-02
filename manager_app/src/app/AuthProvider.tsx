"use client";
import { useState, useCallback } from "react";
import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import AutoLoginLoadingScreen from '@/components/AutoLoginLoadingScreen'
import UnassignedUserDialog from '@/components/UnassignedUserDialog'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthLoading, logout } = useAuth(false);
  const { user: userData, isLoading: isUserDataLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  }, [logout]);

  // Show loading screen while auth is loading
  if (!user?.uid && isAuthLoading) {
    return <AutoLoginLoadingScreen />;
  }

  // If user is not logged in, render children (they'll be redirected to login by useAuth)
  if (!user?.uid) {
    return <>{children}</>;
  }

  // Show loading while user data is being fetched from Firestore
  if (isUserDataLoading && !userData) {
    return <AutoLoginLoadingScreen />;
  }

  // If user data is loaded but accessToken is empty/missing, show restricted dialog
  const accessToken = userData?.accessToken;
  const isUnassigned = !accessToken || accessToken.trim() === "";

  if (isUnassigned) {
    return (
      <>
        <UnassignedUserDialog
          open={!isLoggingOut}
          email={user.email || "unknown@email.com"}
          onLogout={handleLogout}
        />
        {/* Render nothing accessible */}
        <div className="fixed inset-0 bg-background" />
      </>
    );
  }

  return <>{children}</>;
}
