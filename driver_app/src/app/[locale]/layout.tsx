import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { HtmlAttributes } from "@/components/HtmlAttributes";
import { PwaInstallButton } from "@/components/pwa-install-button";
import StoreProvider from "../StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "../AuthProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <StoreProvider>
        <AuthProvider>
          <HtmlAttributes locale={locale} />
          <PwaInstallButton />
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </StoreProvider>
    </NextIntlClientProvider>
  );
}
