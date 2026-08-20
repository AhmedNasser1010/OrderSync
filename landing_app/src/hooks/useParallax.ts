"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";

interface ParallaxOptions {
  speed?: number;
}

export function useParallax(options?: ParallaxOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const speed = options?.speed ?? 0.5;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}px`, `${-speed * 100}px`]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return { ref, y, opacity, scrollYProgress };
}

export function useSectionParallax() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const mockupY = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const floatY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return { containerRef, backgroundY, contentY, mockupY, floatY, scrollYProgress };
}
