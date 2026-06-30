"use client";
import { useEffect } from 'react'
import { useAuth } from "@/hooks/useAuth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, authListener } = useAuth(false);

  useEffect(() => {
    authListener()
  }, [authListener])

  if (!isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Loading...</h2>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we check your session.</p>
        </div>
      </div>
    );
  }

  return children;
}