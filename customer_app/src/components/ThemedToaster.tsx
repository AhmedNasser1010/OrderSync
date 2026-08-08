"use client";

import { Toaster } from "sonner";
import {
  CircleCheckBig,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { useAppSelector } from "@/rtk/hooks";

const TOAST_ICONS = {
  success: <CircleCheckBig />,
  info: <Info />,
  warning: <TriangleAlert />,
  error: <CircleX />,
  close: <X />,
};

const TOAST_CLASSNAMES = {
  toast: "app-toast",
  title: "app-toast__title",
  description: "app-toast__desc",
  icon: "app-toast__icon",
  content: "app-toast__content",
  closeButton: "app-toast__close",
};

export function ThemedToaster() {
  const theme = useAppSelector((state) => state.toggle.theme);

  return (
    <Toaster
      theme={theme}
      position="top-center"
      gap={10}
      offset={16}
      visibleToasts={3}
      closeButton
      icons={TOAST_ICONS}
      toastOptions={{ classNames: TOAST_CLASSNAMES }}
    />
  );
}
