"use client";

import { useTranslations } from "next-intl";
import { useSectionParallax } from "@/hooks/useParallax";
import { PhoneMockup } from "../showcase/PhoneMockup";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_LINKS } from "@/lib/constants";
import { TestAccountCard } from "../shared/TestAccountCard";

export function ManagerSection() {
  const t = useTranslations("showcase.manager");
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
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-gradient-manager"
    >
      {/* Background layer */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        {/* Floating chart patterns */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] w-36 h-24 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm p-3"
          aria-hidden="true"
        >
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-12">
            <div className="w-3 bg-brand-purple/40 rounded-t" style={{ height: "40%" }} />
            <div className="w-3 bg-brand-purple/50 rounded-t" style={{ height: "70%" }} />
            <div className="w-3 bg-brand-purple/60 rounded-t" style={{ height: "55%" }} />
            <div className="w-3 bg-brand-purple/70 rounded-t" style={{ height: "85%" }} />
            <div className="w-3 bg-brand-purple/50 rounded-t" style={{ height: "60%" }} />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] right-[10%] w-28 h-20 rounded-lg bg-white/5 border border-white/10 p-2.5"
          aria-hidden="true"
        >
          {/* Mini line chart */}
          <svg viewBox="0 0 100 40" className="w-full h-full">
            <motion.path
              d="M0,35 L20,25 L40,30 L60,15 L80,20 L100,5"
              stroke="rgba(147, 51, 234, 0.5)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2 }}
              viewport={{ once: true }}
            />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[25%] left-[15%] w-24 h-16 rounded-md bg-white/5 border border-white/10 p-2"
          aria-hidden="true"
        >
          <div className="w-8 h-1.5 bg-white/20 rounded mb-1" />
          <div className="text-lg font-bold text-white/30">87%</div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[30%] right-[12%] w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="text-center">
            <div className="text-sm font-bold text-white/40">KPI</div>
            <div className="text-xs text-white/20">↗ 12%</div>
          </div>
        </motion.div>

        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-brand-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-brand-purple/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text */}
          <motion.div style={{ y: contentY }} className="flex-1 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {t("badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-4 leading-tight">
              {t("title")}
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
              {t("subtitle")}
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href={APP_LINKS.manager}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              {t("cta")}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.a>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <TestAccountCard
                label="Manager 1"
                email="manager1@example.com"
                password="123456"
              />
              <TestAccountCard
                label="Manager 2"
                email="manager2@example.com"
                password="123456"
              />
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div style={{ y: mockupY }} className="flex-shrink-0">
            <PhoneMockup
              images={[
                { src: "/images/manager-screen-1.jpg", alt: "Manager App - Analytics Dashboard", width: 1080, height: 2250 },
                { src: "/images/manager-screen-2.jpg", alt: "Manager App - Analytics Dashboard", width: 1080, height: 2253 },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
