import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RetailBeastFX — The System | Trading Analytics & Mechanical Execution",
  description: "The System provides mechanical trading execution with setup expectancy, session heatmaps, Trinity confluence analytics, and MT4/MT5 import. Log trades. Measure evolution.",
  keywords: ["trading journal", "forex journal", "futures journal", "MT4", "MT5", "expectancy", "trading analytics", "trade log"],
  authors: [{ name: "RetailBeastFX" }],
  openGraph: {
    title: "RetailBeastFX — The System",
    description: "Mechanical execution. Trinity confluence. Measured evolution. The System demands discipline.",
    type: "website",
    siteName: "RetailBeastFX",
  },
  twitter: {
    card: "summary_large_image",
    title: "RetailBeastFX — The System",
    description: "Mechanical execution. Trinity confluence. Measured evolution. The System demands discipline.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "facebook-domain-verification": ["sz0759vee18lp5yyrwzo9b6pbqy1cg"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <SpeedInsights />
        <Analytics />
        <Script
          id="fb-sdk"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId      : '1794934857823748',
                  cookie     : true,
                  xfbml      : true,
                  version    : 'v21.0'
                });
                FB.AppEvents.logPageView();
              };
              (function(d, s, id){
                 var js, fjs = d.getElementsByTagName(s)[0];
                 if (d.getElementById(id)) {return;}
                 js = d.createElement(s); js.id = id;
                 js.src = "https://connect.facebook.net/en_US/sdk.js";
                 fjs.parentNode.insertBefore(js, fjs);
               }(document, 'script', 'facebook-jssdk'));
            `,
          }}
        />
      </body>
    </html>
  );
}
