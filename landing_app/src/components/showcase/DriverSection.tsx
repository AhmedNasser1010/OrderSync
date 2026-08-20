"use client";

import { useTranslations } from "next-intl";
import { useSectionParallax } from "@/hooks/useParallax";
import { PhoneMockup } from "../showcase/PhoneMockup";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_LINKS } from "@/lib/constants";
import { TestAccountCard } from "../shared/TestAccountCard";

export function DriverSection() {
  const t = useTranslations("showcase.driver");
  const { containerRef, backgroundY, contentY, mockupY } = useSectionParallax();

  const features = [
    t("feature_1"),
    t("feature_2"),
    t("feature_3"),
    t("feature_4"),
  ];

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-gradient-driver"
    >
      {/* Background layer */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        {/* Topography map lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            d="M0,300 Q250,200 500,300 T1000,300"
            stroke="white"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            viewport={{ once: true }}
          />
          <motion.path
            d="M0,350 Q250,250 500,350 T1000,350"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.3, ease: "easeInOut" }}
            viewport={{ once: true }}
          />
          <motion.path
            d="M0,400 Q250,300 500,400 T1000,400"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.6, ease: "easeInOut" }}
            viewport={{ once: true }}
          />
        </svg>

        {/* Animated route line */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-[30%] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ transform: "rotate(-5deg)" }}
          aria-hidden="true"
        />

        {/* Location pins */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[30%] text-3xl opacity-30"
          aria-hidden="true"
        >
          📍
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[30%] right-[25%] text-3xl opacity-30"
          aria-hidden="true"
        >
          📍
        </motion.div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] right-[35%] text-2xl opacity-20"
          aria-hidden="true"
        >
          🛵
        </motion.div>

        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          {/* Text */}
          <motion.div style={{ y: contentY }} className="flex-1 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {t("badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-4 leading-tight">
              {t("title")}
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
              {t("subtitle")}
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-white/80 justify-center lg:justify-start"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href={APP_LINKS.driver}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              {t("cta")}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.a>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <TestAccountCard
                label="Driver 1"
                email="driver1@example.com"
                password="123456"
              />
              <TestAccountCard
                label="Driver 2"
                email="driver2@example.com"
                password="123456"
              />
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div style={{ y: mockupY }} className="flex-shrink-0">
            <PhoneMockup
              images={[
                { src: "/images/driver-screen-1.jpg", alt: "Driver App", width: 1078, height: 2247 },
                { src: "/images/driver-screen-2.jpg", alt: "Driver App", width: 1078, height: 2247 },
                { src: "/images/driver-screen-3.jpg", alt: "Driver App", width: 1078, height: 2243 },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
