import { PageHeaderSkeleton, AISummaryCardSkeleton, CalendarEventSkeleton } from '@/components/ui/skeleton-components'
import { Skeleton } from '@/components/ui/skeleton'

export default function CalendarLoading() {
    return (
        <main className="min-h-screen bg-black text-white pb-20 font-sans">
            <PageHeaderSkeleton />

            <div className="px-4 pt-6 space-y-6">
                {/* AI Summary Skeleton */}
                <AISummaryCardSkeleton />

                {/* Pre-Event Checklist Skeleton (conditional, but showing for loading) */}
                <div className="rounded-xl bg-gradient-to-br from-blue-950/30 to-[#0F0F10] border border-blue-500/30 p-5 animate-pulse">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-32 mb-2" />
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-32 mb-2" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Calendar Events Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3 flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-7 w-32 rounded-lg" />
                    </div>
                    <div className="flex flex-col">
                        {[1, 2, 3].map((i) => (
                            <CalendarEventSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
