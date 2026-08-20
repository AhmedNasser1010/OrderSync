"use client";

import { useTranslations } from "next-intl";
import { useSectionParallax } from "@/hooks/useParallax";
import { TabletMockup } from "../showcase/TabletMockup";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_LINKS } from "@/lib/constants";
import { TestAccountCard } from "../shared/TestAccountCard";

export function OrdersSection() {
  const t = useTranslations("showcase.orders");
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
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-gradient-orders"
    >
      {/* Background layer */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        {/* Orange accent glows (kitchen lights) */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] right-[15%] w-32 h-32 bg-brand-orange/15 rounded-full blur-3xl"
        />

        {/* Floating order tickets */}
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-28 h-16 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
          aria-hidden="true"
        >
          <div className="p-2.5">
            <div className="w-8 h-1.5 bg-brand-orange/30 rounded mb-1.5" />
            <div className="w-16 h-1 bg-white/10 rounded mb-1" />
            <div className="flex gap-1">
              <div className="w-4 h-1 bg-white/15 rounded" />
              <div className="w-3 h-1 bg-brand-orange/20 rounded" />
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          className="absolute bottom-[20%] left-[8%] w-24 h-14 rounded-lg bg-white/5 border border-white/10"
          aria-hidden="true"
        >
          <div className="p-2">
            <div className="w-6 h-1.5 bg-green-400/30 rounded mb-1" />
            <div className="w-14 h-1 bg-white/10 rounded" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] left-[5%] w-20 h-12 rounded-md bg-white/5 border border-white/10"
          aria-hidden="true"
        >
          <div className="p-2">
            <div className="w-10 h-1 bg-white/15 rounded" />
          </div>
        </motion.div>

        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl" />
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
              href={APP_LINKS.kitchen}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
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
            <TabletMockup
              images={[
                { src: "/images/orders-screen-1.png", alt: "Orders App - Kitchen Board", width: 2047, height: 2731 },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
