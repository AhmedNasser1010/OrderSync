import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAllDocs } from "@/lib/docs";
import { DocsIndex } from "./DocsIndex";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata() {
  return {
    title: "Docs — OrderSync",
    description: "OrderSync platform documentation.",
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const docs = getAllDocs();

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-brand-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <DocsIndex docs={docs} />
        </div>
      </main>
      <Footer />
    </>
  );
}
