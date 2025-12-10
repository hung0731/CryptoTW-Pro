import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LiffProvider } from "@/components/LiffProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoTW Alpha",
  description: "Crypto Market Insights & Exclusive Airdrops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
          <AnnouncementBanner />
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}
