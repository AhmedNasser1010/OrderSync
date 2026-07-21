import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/globals.css";
import StoreProvider from "./StoreProvider";
import AuthProvider from "./AuthProvider";
import { AuthProvider as AuthContextProvider } from "@/contexts/AuthContext";
import PopupProvider from "./PopupProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthContextProvider>
              <AuthProvider>
                <PopupProvider>{children}</PopupProvider>
                <Toaster />
              </AuthProvider>
            </AuthContextProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
