"use client";

import { useTranslations } from "next-intl";
import { useSectionParallax } from "@/hooks/useParallax";
import { PhoneMockup } from "../showcase/PhoneMockup";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_LINKS } from "@/lib/constants";
import { TestAccountCard } from "../shared/TestAccountCard";

export function CustomerSection() {
  const t = useTranslations("showcase.customer");
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
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-gradient-customer"
    >
      {/* Background layer with parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        {/* Floating food items */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] text-5xl opacity-20"
          aria-hidden="true"
        >
          🍕
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] right-[12%] text-4xl opacity-15"
          aria-hidden="true"
        >
          🍔
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[20%] left-[15%] text-4xl opacity-15"
          aria-hidden="true"
        >
          🍜
        </motion.div>
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[30%] right-[8%] text-5xl opacity-20"
          aria-hidden="true"
        >
          🥗
        </motion.div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
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
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href={APP_LINKS.customer}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-orange font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              {t("cta")}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.a>

            <div className="mt-4">
              <TestAccountCard
                label="Test Account"
                note="Use regular Google auth"
                password="123456"
              />
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div style={{ y: mockupY }} className="flex-shrink-0">
            <PhoneMockup
              images={[
                { src: "/images/customer-screen-1.jpg", alt: "Customer App - OrderSync", width: 1078, height: 2239 },
                { src: "/images/customer-screen-2.jpg", alt: "Customer App - OrderSync", width: 1078, height: 2247 },
                { src: "/images/customer-screen-3.jpg", alt: "Customer App - OrderSync", width: 1080, height: 2251 },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
