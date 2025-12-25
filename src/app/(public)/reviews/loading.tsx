import { AISummaryCardSkeleton, ReviewCardSkeleton, StatsGridSkeleton } from '@/components/ui/skeleton-components'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewsLoading() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Sticky Header Skeleton */}
            <div className="sticky top-[56px] z-30 bg-black/95 backdrop-blur-xl border-b border-[#1A1A1A]">
                {/* Top Stats Row */}
                <div className="px-4 pt-4 pb-2">
                    <StatsGridSkeleton />
                </div>

                {/* Search Bar */}
                <div className="px-4 pb-2">
                    <Skeleton className="h-9 w-full rounded-xl" />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-7 w-20 rounded-full shrink-0" />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
                {/* AI Summary Skeleton */}
                <AISummaryCardSkeleton />

                {/* Reviews List Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3 flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex flex-col">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <ReviewCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
