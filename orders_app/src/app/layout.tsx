import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/globals.css";
import StoreProvider from './StoreProvider'
import AuthProvider from './AuthProvider'
import PopupProvider from './PopupProvider'

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
  title: "Orders",
  description: "Orders Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <AuthProvider>
        <PopupProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              {children}
            </body>
          </html>
        </PopupProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
