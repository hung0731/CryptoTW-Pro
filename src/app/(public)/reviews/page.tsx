'use client';

import { PageHeader } from '@/components/PageHeader';
import { ReviewsPageClient } from '@/components/reviews/ReviewsPageClient';

export default function ReviewsPage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <PageHeader title="市場事件庫" showLogo={false} backHref="/" backLabel="返回" />

            {/* Main Library Client */}
            <ReviewsPageClient />
        </main>
    );
}

// --- Component: ReviewCard Removed (Moved to @/components/reviews/ReviewCard) ---
