import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SerwistProvider } from "./serwist";

const GrotThin = localFont({
  src: "./fonts/BasisGrotesquePro-Thin.ttf",
  variable: "--font-grot-thin",
  weight: "300",
});
const GrotReg = localFont({
  src: "./fonts/BasisGrotesquePro-Regular.ttf",
  variable: "--font-grot-reg",
  weight: "400",
});
const GrotMed = localFont({
  src: "./fonts/BasisGrotesquePro-Medium.ttf",
  variable: "--font-grot-med",
  weight: "500",
});
const GrotBold = localFont({
  src: "./fonts/BasisGrotesquePro-Bold.ttf",
  variable: "--font-grot-bold",
  weight: "700",
});
const GrotBlack = localFont({
  src: "./fonts/BasisGrotesquePro-Black.ttf",
  variable: "--font-grot-black",
  weight: "900",
});
const ProximaThin = localFont({
  src: "./fonts/ProximaNovaCond-Thin.ttf",
  variable: "--font-proxima-thin",
  weight: "300",
});
const ProximaMed = localFont({
  src: "./fonts/ProximaNovaCond-Medium.ttf",
  variable: "--font-proxima-med",
  weight: "500",
});
const ProximaSemiBold = localFont({
  src: "./fonts/ProximaNovaCond-SemiBold.ttf",
  variable: "--font-proxima-semibold",
  weight: "600",
});
const ProximaBold = localFont({
  src: "./fonts/ProximaNovaCond-Bold.ttf",
  variable: "--font-proxima-bold",
  weight: "700",
});
const ProximaBlack = localFont({
  src: "./fonts/ProximaNovaCond-Black.ttf",
  variable: "--font-proxima-black",
  weight: "900",
});
const Beiruti = localFont({
  src: "./fonts/Beiruti-VariableFont_wght.ttf",
  variable: "--font-beiruti",
  weight: "100 900",
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
        className={`${GrotThin.variable} ${GrotReg.variable} ${GrotMed.variable} ${GrotBold.variable} ${GrotBlack.variable} ${ProximaThin.variable} ${ProximaMed.variable} ${ProximaSemiBold.variable} ${ProximaBold.variable} ${ProximaBlack.variable} ${Beiruti.variable} min-h-full flex flex-col`}
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
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </StoreProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
