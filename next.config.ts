import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  // Zeabur 優化：移除 standalone，讓平台自動處理
  output: 'standalone' as const,

  // 啟用壓縮
  compress: true,


  typescript: {
    ignoreBuildErrors: true,
  },

  // 實驗性功能：加速構建
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          // Note: X-Frame-Options removed to avoid conflict with LIFF framing needs
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // 優化的 Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com *.googletagmanager.com *.line.me *.line-scdn.net static.line-scdn.net",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' blob: data: *.supabase.co https://*.line-scdn.net https://profile.line-scdn.net https://obs.line-scdn.net https://api.coinglass.com",
              // Added *.line-scdn.net to connect-src to allow fetching LIFF config
              "connect-src 'self' *.supabase.co *.google-analytics.com https://api.coinglass.com https://open-api.coinglass.com wss://*.supabase.co *.line.me https://*.line.me https://access.line.me https://*.line-scdn.net",
              "font-src 'self' data: fonts.gstatic.com",
              "frame-ancestors *",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // API Routes 的 Cache Headers
      {
        source: '/api/coinglass/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=900, stale-while-revalidate=1800',
          },
        ],
      },
      {
        source: '/api/market/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);
