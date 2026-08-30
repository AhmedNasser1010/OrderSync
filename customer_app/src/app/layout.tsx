import type { Metadata, Viewport } from "next";
import { Cairo, Alexandria } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { AuthBootstrap } from "@/components/AuthBootstrap";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SerwistProvider } from "./serwist";

const CairoFont = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});
const AlexandriaFont = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
});

export const metadata: Metadata = {
  applicationName: "زاجل",
  title: "زاجل",
  description:
    "اطلب أكل لذيذ أونلاين من مطاعمك المحلية المفضلة مع زاجل. توصيل أكل سريع وموثوق لحد بابك.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "زاجل",
  },
  icons: {
    icon: "/icons/icon-192-v2.png",
    apple: "/icons/apple-touch-icon-v2.png",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "زاجل",
    title: "زاجل",
    description:
      "اطلب أكل لذيذ أونلاين من مطاعمك المحلية المفضلة مع زاجل. توصيل أكل سريع وموثوق لحد بابك.",
  },
  twitter: {
    card: "summary",
    title: "زاجل",
    description:
      "اطلب أكل لذيذ أونلاين من مطاعمك المحلية المفضلة مع زاجل. توصيل أكل سريع وموثوق لحد بابك.",
  },
};

export const viewport: Viewport = {
  themeColor: "#9333EA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="ar"
      dir="rtl"
      className="h-full antialiased"
    >
      <body
        className={`${CairoFont.variable} ${AlexandriaFont.variable} min-h-full flex flex-col`}
      >
        {process.env.NODE_ENV !== "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){if(!("serviceWorker" in navigator))return;navigator.serviceWorker.getRegistrations().then(function(r){for(var i=0;i<r.length;i++)r[i].unregister();});})();`,
            }}
          />
        )}
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV !== "production"}
        >
          <StoreProvider>
            <ThemeProvider>
              <AuthBootstrap>{children}</AuthBootstrap>
            </ThemeProvider>
          </StoreProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
