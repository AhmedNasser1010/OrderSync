import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { HtmlAttributes } from "@/components/HtmlAttributes";
import { ThemedToaster } from "@/components/ThemedToaster";
import HomeHeader from "@/components/Home/HomeHeader";
import MobileDrawer from "@/components/MobileDrawer";
import MainContent from "@/components/MainContent";
import OrderSidebar from "@/components/Sidebar/OrderSidebar";
import PopupProvider from "@/components/PopupProvider";
import ProfileIncompleteController from "@/components/ProfileIncompleteController";
import { PwaInstallButton } from "@/components/pwa-install-button";
import ComingSoonGate from "@/components/ComingSoon/ComingSoonGate";
import MaintenanceGate from "@/components/Maintenance/MaintenanceGate";
import HomeBottomNav from "@/components/Home/HomeBottomNav";

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
          <ProfileIncompleteController />
          <HomeHeader />
          <MainContent>{children}</MainContent>
          <ComingSoonGate />
          <MaintenanceGate />
          <MobileDrawer />
          <OrderSidebar />
          <PwaInstallButton />
          <HomeBottomNav />
      </PopupProvider>
      <ThemedToaster />
    </NextIntlClientProvider>
  );
}
