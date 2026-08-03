import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { HtmlAttributes } from "@/components/HtmlAttributes";
import { ThemedToaster } from "@/components/ThemedToaster";
import Header from "@/components/Header";
import LoginSidebar from "@/components/Sidebar/LoginSidebar";
import OrderSidebar from "@/components/Sidebar/OrderSidebar";
import PopupProvider from "@/components/PopupProvider";

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
      <HtmlAttributes locale={locale} />
      <PopupProvider>
        <Header />
        <main id="main-content" className="pt-20 min-h-screen bg-background">{children}</main>
        <LoginSidebar />
        <OrderSidebar />
      </PopupProvider>
      <ThemedToaster />
    </NextIntlClientProvider>
  );
}
