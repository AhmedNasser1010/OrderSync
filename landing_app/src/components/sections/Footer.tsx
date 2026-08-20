"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { APP_LINKS } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");

  const appLinks = [
    { label: t("app_customer"), href: APP_LINKS.customer },
    { label: t("app_onboarding"), href: APP_LINKS.onboarding },
    { label: t("app_kitchen"), href: APP_LINKS.kitchen },
    { label: t("app_driver"), href: APP_LINKS.driver },
    { label: t("app_manager"), href: APP_LINKS.manager },
  ];

  return (
    <footer id="footer" className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="text-xl font-bold font-display">OrderSync</span>
          </Link>

          {/* Apps */}
          <div className="flex flex-wrap justify-center gap-4">
            {appLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">{t("copyright")}</p>
          <a
            href="https://ahmednasser-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Built by Ahmed Nasser
          </a>
        </div>
      </div>
    </footer>
  );
}
