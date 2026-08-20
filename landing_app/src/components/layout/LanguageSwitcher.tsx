"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    const path = pathname.replace(/^\/(en|ar)(\/|$)/, "/") || "/";
    router.replace(path, { locale: next });
  };

  return (
    <motion.button
      onClick={toggleLocale}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-2 rounded-full glass text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === "en" ? "عربي" : "EN"}</span>
    </motion.button>
  );
}
