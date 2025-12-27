import { PageHeader } from '@/components/PageHeader'
import { FullNewsFeed } from '@/components/news/FullNewsFeed'
import { SPACING } from '@/lib/design-tokens'
import { Metadata } from 'next'
import { BASE_URL } from '@/lib/seo-utils'

export const metadata: Metadata = {
    title: '加密貨幣即時快訊 - Crypto News Feed | CryptoTW Pro',
    description: '24 小時不間斷的加密貨幣市場快訊。即時追蹤 BTC、ETH、DeFi 與 NFT 的最新動態與利好利空消息。',
    keywords: ['加密貨幣快訊', '比特幣新聞', '區塊鏈快訊', 'Crypto News', 'Real-time Updates'],
    alternates: {
        canonical: '/news',
    }
}

export default function NewsPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '加密貨幣即時快訊',
        description: '24 小時不間斷的加密貨幣市場快訊',
        url: `${BASE_URL}/news`
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageHeader title="快訊中心" showLogo={false} backHref="/" backLabel="返回" />

            <div className={`p-4 ${SPACING.cardGap}`}>

                {/* Section: Full News Feed */}
                <section>
                    <FullNewsFeed />
                </section>

            </div>

        </main>
    )
}
