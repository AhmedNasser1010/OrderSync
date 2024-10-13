"use client";
import { useEffect } from 'react'
import useAuth from "@/hooks/useAuth";
import AutoLoginLoadingScreen from '@/components/AutoLoginLoadingScreen'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthLoading, authListener } = useAuth();

  useEffect(() => {
    authListener()
  }, [authListener])

  if (!user?.uid && isAuthLoading) {
    return <AutoLoginLoadingScreen />;
  }

  return children;
}
