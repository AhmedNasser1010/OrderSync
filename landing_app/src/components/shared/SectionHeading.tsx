"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle: string;
  light?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  light = false,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
    >
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4 ${
          light ? "text-white" : "text-brand-navy"
        }`}
      >
        {title}
      </h2>
      <p
        className={`text-base sm:text-lg ${
          light ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        {subtitle}
      </p>
    </motion.div>
  );
}
