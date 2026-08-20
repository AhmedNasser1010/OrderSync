"use client";

import { Link } from "@/i18n/routing";
import { FileText } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

export function DocsSidebar({
  docs,
  currentSlug,
}: {
  docs: DocMeta[];
  currentSlug: string;
}) {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-white/10 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <nav className="p-6 space-y-1">
        <Link
          href="/docs"
          className="block px-3 py-2 text-sm font-medium text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-all mb-4"
        >
          All Docs
        </Link>
        <div className="border-t border-white/10 pt-4 mb-4" />
        {docs.map((doc) => {
          const isActive = doc.slug === currentSlug;
          return (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
                isActive
                  ? "bg-brand-orange/15 text-brand-orange font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0 opacity-60" />
              <span className="truncate">{doc.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
