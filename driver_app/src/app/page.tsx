"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/orders/active");
    } else if (!isLoading) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );
}
