import { PageHeaderSkeleton } from '@/components/ui/skeleton-components'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            <PageHeaderSkeleton />

            <div className="pt-6 max-w-lg mx-auto px-4 space-y-4">
                {/* Profile Card Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>

                {/* Settings Section Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3">
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="divide-y divide-white/5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-9 h-9 rounded-lg" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* More Section Skeleton */}
                <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] px-4 py-3">
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="divide-y divide-white/5">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-9 h-9 rounded-lg" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout Button Skeleton */}
                <Skeleton className="h-12 w-full rounded-xl" />

                {/* Version Skeleton */}
                <div className="text-center pt-2">
                    <Skeleton className="h-3 w-32 mx-auto" />
                </div>
            </div>
        </div>
    )
}
