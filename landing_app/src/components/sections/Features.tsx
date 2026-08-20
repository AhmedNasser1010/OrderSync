"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "../shared/SectionHeading";
import { AnimatedSection } from "../shared/AnimatedSection";
import { motion } from "framer-motion";
import {
  Zap,
  Globe,
  WifiOff,
  Route,
  BarChart3,
  Percent,
  Bell,
  MapPin,
  Shield,
} from "lucide-react";

export function Features() {
  const t = useTranslations("features");

  const features = [
    {
      key: "realtime",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      key: "i18n",
      icon: Globe,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      key: "offline",
      icon: WifiOff,
      color: "text-gray-500",
      bg: "bg-gray-50",
    },
    {
      key: "routing",
      icon: Route,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      key: "analytics",
      icon: BarChart3,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      key: "discounts",
      icon: Percent,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      key: "notifications",
      icon: Bell,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      key: "maps",
      icon: MapPin,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      key: "roles",
      icon: Shield,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t("section_title")}
          subtitle={t("section_subtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.key} delay={i * 0.08} className="h-full">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative h-full p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all bg-white"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold font-display text-brand-navy mb-2">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`${feature.key}.desc`)}
                </p>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
