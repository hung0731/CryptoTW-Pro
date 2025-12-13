'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
    // Type of loading skeleton
    type?: 'cards' | 'list' | 'detail' | 'stats' | 'profile'

    // Number of items for cards/list
    count?: number

    // Custom class
    className?: string
}

export function LoadingState({ type = 'cards', count = 3, className }: LoadingStateProps) {
    switch (type) {
        case 'cards':
            return (
                <div className={cn("space-y-3", className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="bg-neutral-900/50 rounded-xl border border-white/5 p-4">
                            <div className="flex gap-3">
                                <Skeleton className="w-16 h-16 rounded-lg bg-neutral-800" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                                    <Skeleton className="h-3 w-full bg-neutral-800" />
                                    <Skeleton className="h-3 w-1/2 bg-neutral-800" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case 'list':
            return (
                <div className={cn("bg-neutral-900/50 rounded-xl border border-white/5 divide-y divide-white/5", className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="p-3 flex items-center justify-between">
                            <Skeleton className="h-3 w-3/4 bg-neutral-800" />
                            <Skeleton className="h-3 w-4 bg-neutral-800" />
                        </div>
                    ))}
                </div>
            )

        case 'detail':
            return (
                <div className={cn("space-y-4", className)}>
                    <Skeleton className="h-48 w-full rounded-xl bg-neutral-800" />
                    <Skeleton className="h-6 w-3/4 bg-neutral-800" />
                    <Skeleton className="h-4 w-full bg-neutral-800" />
                    <Skeleton className="h-4 w-full bg-neutral-800" />
                    <Skeleton className="h-4 w-2/3 bg-neutral-800" />
                </div>
            )

        case 'stats':
            return (
                <div className={cn("grid grid-cols-3 gap-2", className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                            <Skeleton className="h-3 w-12 bg-neutral-800 mb-2" />
                            <Skeleton className="h-6 w-16 bg-neutral-800 mb-1" />
                            <Skeleton className="h-2 w-10 bg-neutral-800" />
                        </div>
                    ))}
                </div>
            )

        case 'profile':
            return (
                <div className={cn("space-y-4", className)}>
                    <div className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
                        <Skeleton className="w-16 h-16 rounded-full bg-neutral-800" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32 bg-neutral-800" />
                            <Skeleton className="h-4 w-20 bg-neutral-800" />
                        </div>
                    </div>
                    <Skeleton className="h-48 w-full rounded-xl bg-neutral-800" />
                </div>
            )

        default:
            return (
                <div className={cn("space-y-3", className)}>
                    <Skeleton className="h-20 w-full rounded-xl bg-neutral-800" />
                </div>
            )
    }
}

// Inline loading spinner
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    return (
        <div className={cn("animate-spin rounded-full border-2 border-neutral-700 border-t-white", sizeClasses[size])} />
    )
}

// Full page loading
export function PageLoading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <img src="/logo.svg" alt="" className="h-6 w-auto opacity-50 animate-pulse" />
                <LoadingSpinner size="md" />
            </div>
        </div>
    )
}
