import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { LiffProvider } from "@/components/LiffProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { RouteHandler } from "@/components/RouteHandler"; // New Import
import { Suspense } from "react"; // Required for useSearchParams

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans",
  display: "swap",
});



export const metadata: Metadata = {
  title: "加密台灣 Pro",
  description: "Crypto Market Insights & Exclusive Airdrops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} font-sans antialiased`}>
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
          <Suspense fallback={null}>
            <RouteHandler />
          </Suspense>
          <AnnouncementBanner />
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}
