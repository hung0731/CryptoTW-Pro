import type { Metadata } from "next";
import { Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { LiffProvider } from "@/components/LiffProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-serif",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans",
  display: "swap",
});

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
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} ${notoSerifTC.variable} font-sans antialiased`}>
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
          <AnnouncementBanner />
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}
