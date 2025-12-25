import { Skeleton } from '@/components/ui/skeleton'
import { SPACING } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

/**
 * 共用骨架元件 - 用於 loading.tsx
 */

export function PageHeaderSkeleton() {
    return (
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between h-14 px-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    )
}

export function AISummaryCardSkeleton() {
    return (
        <div className="rounded-xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 p-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <div className="w-5 h-5 bg-indigo-400/30 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-5/6 bg-white/10" />
                </div>
            </div>
        </div>
    )
}

export function UniversalCardSkeleton({
    rows = 3,
    showHeader = true
}: {
    rows?: number
    showHeader?: boolean
}) {
    return (
        <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
            {showHeader && (
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3">
                    <Skeleton className="h-5 w-32" />
                </div>
            )}
            <div className="divide-y divide-[#1A1A1A]">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-5 flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                        <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function StatsGridSkeleton() {
    return (
        <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1A1A1A]">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 flex flex-col items-center justify-center text-center">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function NewsItemSkeleton() {
    return (
        <div className="px-5 py-4 border-b border-[#1A1A1A] last:border-0 animate-pulse">
            <div className="flex items-start gap-4">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
            </div>
        </div>
    )
}

export function CalendarEventSkeleton() {
    return (
        <div className="border-b border-[#1A1A1A] p-5 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="rounded-lg bg-[#050505] border border-[#1A1A1A] p-3">
                <div className="flex gap-2.5 overflow-x-auto">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="flex-shrink-0 w-[130px] h-32 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function ReviewCardSkeleton() {
    return (
        <div className="px-5 py-6 border-b border-[#1A1A1A] last:border-0 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-4 rounded" />
            </div>
        </div>
    )
}
