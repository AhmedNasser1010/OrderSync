"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SECTION_ANCHORS, DOCS_PATH } from "@/lib/constants";

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("apps"), href: SECTION_ANCHORS.showcase },
    { label: t("features"), href: SECTION_ANCHORS.features },
    { label: t("ecosystem"), href: SECTION_ANCHORS.ecosystem },
    { label: t("contact"), href: SECTION_ANCHORS.footer },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/30 backdrop-blur-2xl shadow-lg shadow-black/10"
          : "bg-black/10 backdrop-blur-md"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20"
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`rounded-xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/25 group-hover:shadow-brand-orange/40 transition-all duration-300 ${
              scrolled ? "w-8 h-8 lg:w-9 lg:h-9" : "w-9 h-9 lg:w-10 lg:h-10"
            }`}>
              <svg viewBox="0 0 24 24" className={`text-white fill-current transition-all duration-300 ${
                scrolled ? "w-4 h-4 lg:w-5 lg:h-5" : "w-5 h-5 lg:w-6 lg:h-6"
              }`}>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className={`font-bold text-white font-display tracking-tight transition-all duration-300 ${
              scrolled ? "text-lg lg:text-xl" : "text-xl lg:text-2xl"
            }`}>
              OrderSync
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
            <Link
              href={DOCS_PATH}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {t("docs")}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <motion.a
              href={SECTION_ANCHORS.showcase}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-brand-orange text-white text-sm font-semibold rounded-full shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:bg-brand-orange/90 transition-all duration-300 ${
                scrolled ? "px-4 py-2" : "px-5 py-2.5"
              }`}
            >
              {t("getStarted")}
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-white/80 hover:text-white"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/30 backdrop-blur-2xl border-t border-white/10"
            role="menu"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={DOCS_PATH}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {t("docs")}
              </Link>
              <a
                href={SECTION_ANCHORS.showcase}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 bg-brand-orange text-white text-sm font-semibold rounded-lg text-center mt-2"
              >
                {t("getStarted")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
