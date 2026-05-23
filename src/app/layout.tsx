import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

import "./globals.css";

const hkGroteskWide = localFont({
  src: [
    {
      path: "./fonts/hkgroteskwide-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/hkgroteskwide-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hk-grotesk-wide",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Competitor Price Intelligence Engine",
  description:
    "Track competitor pricing, volatility, and market arbitrage spreads in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${hkGroteskWide.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
