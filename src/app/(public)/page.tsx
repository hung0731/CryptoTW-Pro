import { HomePageClient } from './HomePageClient'
import { Metadata } from 'next'
import { constructMetadata } from '@/lib/seo/metadata'
import { UI_LABELS } from '@/config/naming'

// Enhanced SEO Metadata
export const metadata: Metadata = constructMetadata({
    title: UI_LABELS.HOME.HERO_TITLE,
    description: '專為台灣投資人打造的 Web3 研究助理。提供比特幣恐懼貪婪指數、ETF 資金流向、鏈上數據分析與即時市場覆盤。',
    path: '/',
})

// Server Component - Optimized for fast initial load
export default async function HomePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: UI_LABELS.BRAND_NAME,
        url: 'https://pro.cryptotw.com',
        description: '台灣首選加密貨幣市場研究平台',
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomePageClient />
        </>
    )
}
