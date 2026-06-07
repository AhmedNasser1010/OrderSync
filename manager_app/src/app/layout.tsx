import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import StoreProvider from "./StoreProvider";
import AuthProvider from "./AuthProvider";
import PopupProvider from "./PopupProvider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/dashboard/bottom-nav";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OrderSync | Home",
  description: "Track your restaurant performance and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <AuthProvider>
            <PopupProvider>
              <div className="flex flex-col space-y-4 p-4 md:p-6 bg-background">
                {children}
                <BottomNav />
              </div>
            </PopupProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
