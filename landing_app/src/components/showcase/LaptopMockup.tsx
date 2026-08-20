"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ImageCarousel } from "./ImageCarousel";

interface LaptopMockupProps {
  src?: string;
  alt?: string;
  images?: { src: string; alt: string; width: number; height: number }[];
  className?: string;
}

export function LaptopMockup({
  src,
  alt = "",
  images,
  className = "",
}: LaptopMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className={`relative ${className}`}
    >
      {/* Laptop screen */}
      <div className="relative w-[340px] sm:w-[420px] lg:w-[520px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-[12px] sm:rounded-t-[14px] p-[3px] shadow-2xl shadow-black/40">
        {/* Inner bezel */}
        <div className="relative w-full bg-gray-900 rounded-t-[9px] sm:rounded-t-[11px] p-[8px] sm:p-[10px]">
          {/* Screen */}
          <div className="relative w-full bg-black rounded-[4px] sm:rounded-[6px] overflow-hidden" style={{ imageRendering: "auto", contain: "layout paint" }}>
            {/* Camera */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full z-10" />

            {/* Screenshot */}
            {images && images.length > 0 ? (
              <ImageCarousel images={images} />
            ) : (
              <Image
                src={src!}
                alt={alt}
                width={1600}
                height={1000}
                className="w-full h-auto"
                sizes="520px"
                draggable={false}
              />
            )}

            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Laptop base */}
      <div className="relative mx-auto w-[380px] sm:w-[460px] lg:w-[560px] h-[14px] sm:h-[16px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg shadow-xl">
        {/* Trackpad notch */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[3px] bg-gray-600 rounded-t-sm" />
      </div>

      {/* Laptop stand shadow */}
      <div className="mx-auto w-[300px] sm:w-[380px] lg:w-[460px] h-2 bg-gradient-to-b from-black/20 to-transparent rounded-full blur-sm" />

      {/* Glow effect */}
      <div className="absolute -inset-10 bg-brand-orange/10 rounded-full blur-3xl -z-10 animate-pulse-glow" />
    </motion.div>
  );
}
