import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Cricopedia | T20 World Cup Edition",
  description: "Join Cricopedia, the ultimate cricket prediction game! Predict T20 World Cup match outcomes, earn points, and compete on the leaderboard.",
  keywords: ["T20 World Cup", "Cricket", "Prediction", "Game", "Leaderboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
