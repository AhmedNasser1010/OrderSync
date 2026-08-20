"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ImageCarousel } from "./ImageCarousel";

interface TabletMockupProps {
  src?: string;
  alt?: string;
  images?: { src: string; alt: string; width: number; height: number }[];
  className?: string;
}

export function TabletMockup({
  src,
  alt = "",
  images,
  className = "",
}: TabletMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className={`relative ${className}`}
    >
      {/* Tablet frame */}
      <div className="relative w-[380px] sm:w-[440px] lg:w-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[20px] sm:rounded-[24px] p-[3px] shadow-2xl shadow-black/40">
        {/* Inner bezel */}
        <div className="relative w-full bg-gray-900 rounded-[17px] sm:rounded-[21px] p-[10px] sm:p-[12px]">
          {/* Screen */}
          <div className="relative w-full bg-black rounded-[8px] sm:rounded-[10px] overflow-hidden" style={{ imageRendering: "auto", contain: "layout paint" }}>
            {/* Camera */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full z-10" />

            {/* Screenshot */}
            {images && images.length > 0 ? (
              <ImageCarousel images={images} />
            ) : (
              <Image
                src={src!}
                alt={alt}
                width={800}
                height={600}
                className="w-full h-auto"
                sizes="500px"
                draggable={false}
              />
            )}

            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-10 bg-brand-orange/10 rounded-full blur-3xl -z-10 animate-pulse-glow" />
    </motion.div>
  );
}
