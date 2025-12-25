/**
 * Extended Skeleton Components
 * 
 * Additional specialized skeleton loaders for specific use cases
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { UniversalCard } from '@/components/ui/UniversalCard';

/**
 * Review/Event Card Skeleton
 */
export function EventCardSkeleton() {
    return (
        <UniversalCard className="pointer-events-none">
            <div className="space-y-4">
                {/* Header with icon */}
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>

                {/* Title */}
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-4/5" />

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-3" />
                </div>
            </div>
        </UniversalCard>
    );
}

/**
 * Chart Card Skeleton  
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <UniversalCard className="pointer-events-none">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Chart area */}
                <Skeleton className="w-full" style={{ height: `${height}px` }} />

                {/* Legend */}
                <div className="flex gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </UniversalCard>
    );
}

/**
 * List of Event Cards
 */
export function EventListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <EventCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Stats Grid Skeleton
 */
export function StatsGridSkeleton({ cols = 4 }: { cols?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: cols }).map((_, i) => (
                <UniversalCard key={i} size="S" className="pointer-events-none">
                    <div className="text-center space-y-2">
                        <Skeleton className="h-3 w-20 mx-auto" />
                        <Skeleton className="h-8 w-16 mx-auto" />
                    </div>
                </UniversalCard>
            ))}
        </div>
    );
}
