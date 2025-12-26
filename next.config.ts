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
    return [];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);
