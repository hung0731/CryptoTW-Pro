import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans",
  display: "swap",
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://pro.cryptotw.com'),
  title: {
    default: "加密台灣 Pro | 您的鏈上軍火庫",
    template: "%s | 加密台灣 Pro"
  },
  description: "每日市場分析、獨家空投機會、專業交易指標。加密台灣 Pro 提供最即時的加密貨幣市場洞察。",
  keywords: ["加密貨幣", "比特幣", "區塊鏈", "交易訊號", "空投", "CryptoTW"],
  authors: [{ name: "CryptoTW Team" }],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: '/',
    siteName: '加密台灣 Pro',
    title: '加密台灣 Pro | 您的鏈上軍火庫',
    description: '每日市場分析、獨家空投機會、專業交易指標。',
    images: [
      {
        url: '/icon.png', // Temporary default
        width: 512,
        height: 512,
        alt: '加密台灣 Pro Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '加密台灣 Pro',
    description: '每日市場分析、獨家空投機會、專業交易指標。',
    images: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.png', // Apple still prefers PNG for home screen
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
