import type { Metadata } from "next";
import { Cairo, Alexandria } from "next/font/google";
import "./globals.css";

const CairoFont = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});
const AlexandriaFont = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
});

export const metadata: Metadata = {
  title: "OrderSync — The Complete Food Delivery Platform",
  description:
    "Connect restaurants, drivers, and customers with one powerful real-time platform. Five apps, one Firebase backend.",
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "OrderSync",
    title: "OrderSync — The Complete Food Delivery Platform",
    description:
      "Connect restaurants, drivers, and customers with one powerful real-time platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
