"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "../shared/SectionHeading";
import { AnimatedSection } from "../shared/AnimatedSection";
import { motion } from "framer-motion";
import { ShoppingCart, ChefHat, Truck, BarChart3 } from "lucide-react";

export function Ecosystem() {
  const t = useTranslations("ecosystem");

  const steps = [
    {
      icon: ShoppingCart,
      title: t("step_1_title"),
      desc: t("step_1_desc"),
      color: "from-orange-500 to-red-500",
      iconColor: "text-orange-500",
    },
    {
      icon: ChefHat,
      title: t("step_2_title"),
      desc: t("step_2_desc"),
      color: "from-gray-600 to-gray-800",
      iconColor: "text-gray-600",
    },
    {
      icon: Truck,
      title: t("step_3_title"),
      desc: t("step_3_desc"),
      color: "from-emerald-500 to-cyan-500",
      iconColor: "text-emerald-500",
    },
    {
      icon: BarChart3,
      title: t("step_4_title"),
      desc: t("step_4_desc"),
      color: "from-indigo-500 to-purple-600",
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <section id="ecosystem" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t("section_title")}
          subtitle={t("section_subtitle")}
        />

        {/* Flow diagram */}
        <div className="relative">
          {/* Connection lines (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="w-full h-full bg-gradient-to-r from-orange-300 via-gray-300 via-emerald-300 to-indigo-300 origin-left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center group">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center z-10">
                    {i + 1}
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 group-hover:shadow-xl transition-shadow`}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Arrow (mobile) */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden w-[2px] h-8 bg-gray-300 my-2" />
                  )}

                  {/* Content */}
                  <h3 className="text-xl font-bold font-display text-brand-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    {step.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
