"use client";

import { Toaster } from "sonner";
import { useAppSelector } from "@/rtk/hooks";

export function ThemedToaster() {
  const theme = useAppSelector((state) => state.toggle.theme);

  return <Toaster position="top-center" theme={theme} />;
}
