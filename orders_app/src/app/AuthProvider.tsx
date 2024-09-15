"use client";
import useAuth from "@/hooks/useAuth";
import AutoLoginLoadingScreen from '@/components/AutoLoginLoadingScreen'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthLoading } = useAuth(false);

  if (!user?.uid && isAuthLoading) {
    return <AutoLoginLoadingScreen />;
  }

  return children;
}
