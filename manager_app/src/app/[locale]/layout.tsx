import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import localFont from "next/font/local";
import "../globals.css";

import StoreProvider from "../StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "../AuthProvider";
import PopupProvider from "../PopupProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HtmlAttributes } from "@/components/HtmlAttributes";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <>
      <HtmlAttributes locale={locale} fontClass={inter.variable} />
      <NextIntlClientProvider messages={messages}>
        <StoreProvider>
          <ThemeProvider>
            <AuthProvider>
              <AuthGuard>
                <PopupProvider>{children}</PopupProvider>
              </AuthGuard>
            </AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </NextIntlClientProvider>
    </>
  );
}
