import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAllDocs, getDocBySlug } from "@/lib/docs";
import { DocContent } from "./DocContent";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";

export function generateStaticParams() {
  const docs = getAllDocs();
  const locales = routing.locales;

  return locales.flatMap((locale) =>
    docs.map((doc) => ({ locale, slug: doc.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: `${doc.title} — OrderSync Docs`,
    description: doc.excerpt,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const docs = getAllDocs();

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-brand-navy">
        <div className="max-w-7xl mx-auto flex">
          <DocsSidebar docs={docs} currentSlug={slug} />
          <article className="flex-1 min-w-0 px-6 py-10 lg:px-12 lg:py-14">
            <DocContent content={doc.content} />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
