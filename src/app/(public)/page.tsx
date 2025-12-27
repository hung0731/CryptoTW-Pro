import { HomePageClient } from './HomePageClient'
import { Metadata } from 'next'
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo-utils'

// Enhanced SEO Metadata
export const metadata: Metadata = {
    title: '加密台灣 CryptoTW Pro - 台灣首選加密貨幣市場研究平台',
    description: '專為台灣投資人打造的 Web3 資料庫。提供比特幣恐懼貪婪指數、ETF 資金流向、鏈上數據分析與即時市場復盤。',
    alternates: {
        canonical: '/',
    }
}

// Server Component - Optimized for fast initial load
export default async function HomePage() {
    const websiteSchema = generateWebSiteSchema();
    const orgSchema = generateOrganizationSchema();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
            />
            <HomePageClient />
        </>
    )
}
