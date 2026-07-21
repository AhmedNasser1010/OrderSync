"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/orders/active");
    } else if (!isAuthLoading) {
      router.push("/auth/signin");
    }
  }, [user, isAuthLoading, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );
}
