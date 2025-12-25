'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getReviewsByYear } from '@/lib/reviews-data';
import { EventCard } from '@/components/reviews/EventCard';

export default function ReviewYearPage() {
    const params = useParams();
    const year = Number(params.year);
    const reviews = getReviewsByYear(year);

    if (!year || isNaN(year)) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Invalid Year</div>;
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-8 pb-24 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/reviews" className="text-[#808080] hover:text-white">
                        <div className="p-2 bg-[#0A0A0A] rounded-full border border-[#1A1A1A] hover:bg-[#0E0E0F]">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{year} 年度回顧</h1>
                        <p className="text-neutral-500 text-xs">共 {reviews.length} 個重大事件</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <EventCard key={review.id} review={review} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-neutral-900/20 rounded-2xl border border-white/5 text-neutral-500 text-sm">
                            該年度尚無收錄事件
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
