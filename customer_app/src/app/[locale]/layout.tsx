import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { HtmlAttributes } from "@/components/HtmlAttributes";
import { ThemedToaster } from "@/components/ThemedToaster";
import Header from "@/components/Header";
import LoginSidebar from "@/components/Sidebar/LoginSidebar";
import OrderSidebar from "@/components/Sidebar/OrderSidebar";
import PopupProvider from "@/components/PopupProvider";
import { PwaInstallButton } from "@/components/pwa-install-button";
import LoadingScreen from "@/components/LoadingScreen";
import ComingSoonGate from "@/components/ComingSoon/ComingSoonGate";
import MaintenanceGate from "@/components/Maintenance/MaintenanceGate";
import { IS_COMING_SOON } from "@/utils/comingSoon";

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
      <LoadingScreen />
      <HtmlAttributes locale={locale} />
      <PopupProvider>
        <Header />
        <main
          id="main-content"
          className={`pt-20 min-h-screen bg-background ${
            IS_COMING_SOON ? "blur-md pointer-events-none select-none" : ""
          }`}
        >
          {children}
        </main>
        <ComingSoonGate />
        <MaintenanceGate />
        <LoginSidebar />
        <OrderSidebar />
        <PwaInstallButton />
      </PopupProvider>
      <ThemedToaster />
    </NextIntlClientProvider>
  );
}
