import { PageHeaderSkeleton, AISummaryCardSkeleton, NewsItemSkeleton, UniversalCardSkeleton } from '@/components/ui/skeleton-components'

export default function NewsLoading() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeaderSkeleton />

            <div className="p-4 space-y-6">
                {/* AI Summary Skeleton */}
                <AISummaryCardSkeleton />

                {/* News Feed Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3 flex items-center justify-between">
                        <div className="h-5 w-32 bg-[#1A1A1A] rounded animate-pulse" />
                        <div className="h-5 w-12 bg-[#1A1A1A] rounded-full animate-pulse" />
                    </div>

                    {/* News List */}
                    <div className="flex flex-col">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <NewsItemSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
