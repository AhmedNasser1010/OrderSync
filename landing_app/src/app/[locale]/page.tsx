import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/Footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <AppShowcase />
        <Ecosystem />
        <Features />
      </main>
      <Footer />
    </>
  );
}
