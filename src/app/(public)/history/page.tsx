import { PageHeader } from '@/components/PageHeader';
import { HistoryPageClient } from '@/components/history/HistoryPageClient';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { UI_LABELS } from '@/config/naming';

export const metadata: Metadata = constructMetadata({
    title: UI_LABELS.HISTORY.ROOT_TITLE,
    description: '以史為鏡，可以知興替。收錄比特幣歷年重大事件（減半、ETF 通過、黑天鵝事件）的盤面反應與數據回測。',
    path: '/history',
    keywords: ['市場覆盤', '比特幣歷史', '黑天鵝事件', 'Crypto History', 'Market Reviews'],
});

export default function HistoryPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${UI_LABELS.HISTORY.ROOT_TITLE}資料庫`,
        description: `CryptoTW Pro ${UI_LABELS.HISTORY.ROOT_TITLE}資料庫`,
        url: `https://pro.cryptotw.com/history`
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageHeader title={UI_LABELS.HISTORY.ROOT_TITLE} showLogo={false} backHref="/" backLabel="返回" />

            {/* Main Library Client */}
            <HistoryPageClient />
        </main>
    );
}

// --- Component: ReviewCard Removed (Moved to @/components/reviews/ReviewCard) ---
