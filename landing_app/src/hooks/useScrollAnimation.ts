"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

export function useScrollAnimation(options?: {
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: options?.threshold ?? 0.2,
    once: options?.once ?? true,
  });

  return { ref, isInView };
}
