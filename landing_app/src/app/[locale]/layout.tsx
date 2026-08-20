import type { Metadata } from "next";
import { Cairo, Alexandria } from "next/font/google";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import "../globals.css";

const CairoFont = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});
const AlexandriaFont = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: isArabic
      ? "OrderSync — منصة توصيل الطعام الشاملة"
      : "OrderSync — The Complete Food Delivery Platform",
    description: isArabic
      ? "ربط المطاعم والسائقين والعملاء في منصة واحدة قوية في الوقت الفعلي."
      : "Connect restaurants, drivers, and customers with one powerful real-time platform. Five apps, one Firebase backend.",
    icons: {
      icon: "/images/favicon.svg",
    },
    openGraph: {
      type: "website",
      siteName: "OrderSync",
      title: isArabic
        ? "OrderSync — منصة توصيل الطعام الشاملة"
        : "OrderSync — The Complete Food Delivery Platform",
      description: isArabic
        ? "ربط المطاعم والسائقين والعملاء في منصة واحدة قوية في الوقت الفعلي."
        : "Connect restaurants, drivers, and customers with one powerful real-time platform. Five apps, one Firebase backend.",
      images: [
        {
          url: "/images/customer-screen-1.jpg",
          width: 1200,
          height: 630,
          alt: "OrderSync - The Complete Food Delivery Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isArabic
        ? "OrderSync — منصة توصيل الطعام الشاملة"
        : "OrderSync — The Complete Food Delivery Platform",
      description: isArabic
        ? "ربط المطاعم والسائقين والعملاء في منصة واحدة قوية في الوقت الفعلي."
        : "Connect restaurants, drivers, and customers with one powerful real-time platform. Five apps, one Firebase backend.",
      images: ["/images/customer-screen-1.jpg"],
    },
    alternates: {
      canonical: isArabic ? `${SITE_URL}/ar` : `${SITE_URL}/en`,
      languages: {
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full antialiased scroll-smooth">
      <body
        className={`${CairoFont.variable} ${AlexandriaFont.variable} min-h-full flex flex-col font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
