import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AQT Journal - Trading Journal & Analytics for Forex & Futures",
  description: "Professional trading journal with setup expectancy, session heatmaps, R-multiple analytics, and MT4/MT5 import. Journal faster. Find your edge.",
  keywords: ["trading journal", "forex journal", "futures journal", "MT4", "MT5", "expectancy", "trading analytics", "trade log"],
  authors: [{ name: "AQT Journal" }],
  openGraph: {
    title: "AQT Journal - Trading Journal & Analytics",
    description: "Journal faster. Find your edge. See which setups and sessions actually pay.",
    type: "website",
    siteName: "AQT Journal",
  },
  twitter: {
    card: "summary_large_image",
    title: "AQT Journal - Trading Journal & Analytics",
    description: "Journal faster. Find your edge. See which setups and sessions actually pay.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {children}
      </body>
    </html>
  );
}
