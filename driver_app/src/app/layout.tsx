import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "./AuthProvider";
import { HtmlAttributes } from "@/components/HtmlAttributes";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Driver App",
  description: "OrderSync Driver App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <HtmlAttributes locale="en" fontClass={inter.variable} />
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem("theme");
                  if (t) { try { t = JSON.parse(t); } catch(e) {} }
                  if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                    document.documentElement.classList.add("dark");
                  }
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}>
        <StoreProvider>
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
