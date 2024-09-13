"use client";
import useAuth from "@/hooks/useAuth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthLoading } = useAuth(false);

  if (!user?.uid && isAuthLoading) {
    return <div>Logging in...</div>;
  }

  return children;
}
