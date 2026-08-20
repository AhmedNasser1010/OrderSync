"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ImageCarousel } from "./ImageCarousel";

interface PhoneMockupProps {
  src?: string;
  alt?: string;
  images?: { src: string; alt: string; width: number; height: number }[];
  className?: string;
}

export function PhoneMockup({
  src,
  alt = "",
  images,
  className = "",
}: PhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className={`relative ${className}`}
    >
      {/* Phone frame */}
      <div className="relative w-[260px] sm:w-[280px] lg:w-[300px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[36px] sm:rounded-[42px] p-[3px] shadow-2xl shadow-black/40">
        {/* Inner bezel */}
        <div className="relative w-full bg-gray-900 rounded-[33px] sm:rounded-[39px] p-[10px]">
          {/* Screen */}
          <div className="relative w-full bg-black rounded-[24px] sm:rounded-[28px] overflow-hidden">
            {/* Camera */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full z-10" />

            {/* Screenshot */}
            {images && images.length > 0 ? (
              <ImageCarousel images={images} />
            ) : (
              <Image
                src={src!}
                alt={alt}
                width={600}
                height={1200}
                className="w-full h-auto"
                sizes="300px"
                draggable={false}
              />
            )}

            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -right-[2px] top-24 w-[3px] h-8 bg-gray-700 rounded-r-full" />
        <div className="absolute -right-[2px] top-36 w-[3px] h-12 bg-gray-700 rounded-r-full" />
        <div className="absolute -left-[2px] top-28 w-[3px] h-6 bg-gray-700 rounded-l-full" />

        {/* Home indicator */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center">
          <div className="w-1/3 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-8 bg-brand-orange/10 rounded-full blur-3xl -z-10 animate-pulse-glow" />
    </motion.div>
  );
}
