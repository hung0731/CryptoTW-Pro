'use client';

import { PageHeader } from '@/components/PageHeader';
import { EventLibraryClient } from '@/components/reviews/EventLibraryClient';

export default function ReviewsPage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <PageHeader title="市場事件庫" showLogo={false} backHref="/" backLabel="返回" />

            {/* Main Library Client */}
            <EventLibraryClient />
        </main>
    );
}

// --- Component: ReviewCard Removed (Moved to @/components/reviews/ReviewCard) ---
