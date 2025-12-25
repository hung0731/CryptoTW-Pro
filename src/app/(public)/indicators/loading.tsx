import { PageHeaderSkeleton, AISummaryCardSkeleton, UniversalCardSkeleton } from '@/components/ui/skeleton-components'
import { Skeleton } from '@/components/ui/skeleton'

export default function IndicatorsLoading() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeaderSkeleton />

            <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
                {/* AI Summary Skeleton */}
                <AISummaryCardSkeleton />

                {/* Alpha Tools Section Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3">
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-[#1A1A1A] gap-px bg-[#1A1A1A]">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#0A0A0A] p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
                                <Skeleton className="w-12 h-12 rounded-2xl" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-12 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Market Metrics Section Skeleton */}
                <UniversalCardSkeleton rows={6} showHeader={true} />
            </div>
        </main>
    )
}
