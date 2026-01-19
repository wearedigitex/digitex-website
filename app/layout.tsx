import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteLayoutClient } from "@/components/site-layout-client";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digitex | Independent Tech News",
  description: "A student-led digital publication uniting voices from different fields to explore how technology is reshaping our world.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${beVietnamPro.variable} scroll-smooth antialiased`}>
      <body className="bg-black text-white antialiased selection:bg-teal-500/30 selection:text-teal-200">
        <SiteLayoutClient>
          {children}
        </SiteLayoutClient>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
