"use client";

import { useAuthSession } from "@/hooks/useAuthSession";
import { useCustomerSync } from "@/hooks/useCustomerSync";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuthSession();
  useCustomerSync();
  return <>{children}</>;
}
