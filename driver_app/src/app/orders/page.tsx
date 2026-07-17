"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/orders/active");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );
}
