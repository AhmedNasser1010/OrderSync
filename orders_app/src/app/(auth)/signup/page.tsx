"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import useAuth from "@/hooks/useAuth";

export default function SignUpPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();

  useEffect(() => {
    if (user && !isAuthLoading) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      mode="signup"
      onSuccess={() => {
        router.push("/");
      }}
    />
  );
}
