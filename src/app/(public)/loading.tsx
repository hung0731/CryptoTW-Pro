import { PageHeaderSkeleton, AISummaryCardSkeleton, UniversalCardSkeleton, StatsGridSkeleton } from '@/components/ui/skeleton-components'
import { SPACING } from '@/lib/design-tokens'

export default function HomeLoading() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeaderSkeleton />

            <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
                {/* AI Summary Skeleton */}
                <AISummaryCardSkeleton />

                {/* Market Status Grid Skeleton */}
                <StatsGridSkeleton />

                {/* Featured Cards Skeleton */}
                <UniversalCardSkeleton rows={4} showHeader={true} />

                {/* Additional Sections */}
                <UniversalCardSkeleton rows={3} showHeader={true} />
            </div>
        </main>
    )
}
