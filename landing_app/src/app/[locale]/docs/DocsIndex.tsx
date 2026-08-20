"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

export function DocsIndex({ docs }: { docs: DocMeta[] }) {
  const t = useTranslations("docs");
  return (
    <div>
      <h1 className="text-3xl lg:text-4xl font-bold text-white font-display mb-3">
        {t("title")}
      </h1>
      <p className="text-white/50 text-lg mb-10 max-w-2xl">
        {t("subtitle")}
      </p>

      <div className="grid gap-4">
        {docs.map((doc, i) => (
          <motion.div
            key={doc.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Link
              href={`/docs/${doc.slug}`}
              className="group block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all p-6"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange/20 transition-colors">
                  <FileText className="w-5 h-5 text-brand-orange" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white group-hover:text-brand-orange transition-colors font-display">
                    {doc.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/40 leading-relaxed line-clamp-2">
                    {doc.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
