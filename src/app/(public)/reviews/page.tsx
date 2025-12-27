import { PageHeader } from '@/components/PageHeader';
import { ReviewsPageClient } from '@/components/reviews/ReviewsPageClient';
import { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo-utils';

export const metadata: Metadata = {
    title: '市場歷史復盤資料庫 - Historical Market Review | CryptoTW Pro',
    description: '以史為鏡，可以知興替。收錄比特幣歷年重大事件（減半、ETF 通過、黑天鵝事件）的盤面反應與數據回測。',
    keywords: ['市場復盤', '比特幣歷史', '黑天鵝事件', 'Crypto History', 'Market Reviews'],
    alternates: {
        canonical: '/reviews',
    }
}

export default function ReviewsPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '市場歷史復盤資料庫',
        description: 'CryptoTW Pro 市場歷史事件資料庫',
        url: `${BASE_URL}/reviews`
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageHeader title="市場事件庫" showLogo={false} backHref="/" backLabel="返回" />

            {/* Main Library Client */}
            <ReviewsPageClient />
        </main>
    );
}

// --- Component: ReviewCard Removed (Moved to @/components/reviews/ReviewCard) ---
