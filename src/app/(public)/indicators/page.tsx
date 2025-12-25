'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import IndicatorsPageClient from '@/components/indicators/IndicatorsPageClient';
import { IndicatorsPageViewModel } from '@/lib/services/indicators-list';
import { Skeleton } from '@/components/ui/skeleton';
import { SPACING } from '@/lib/design-tokens';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';

function IndicatorsSkeleton() {
    return (
        <MobileOptimizedLayout className={SPACING.classes.mtHeader}>
            {/* Summary Card Skeleton */}
            <div className="mb-6">
                <Skeleton className="h-24 w-full rounded-xl bg-neutral-900" />
            </div>

            {/* Filter Skeleton */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full bg-neutral-900 flex-shrink-0" />
                ))}
            </div>

            {/* Cards Grid Skeleton */}
            <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="p-5 border-b border-[#1A1A1A] last:border-0 animate-pulse">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-xl bg-neutral-800" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-32 mb-2 bg-neutral-800" />
                                <Skeleton className="h-4 w-20 bg-neutral-800" />
                            </div>
                            <div className="text-right">
                                <Skeleton className="h-6 w-16 mb-1 bg-neutral-800" />
                                <Skeleton className="h-3 w-24 bg-neutral-800" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </MobileOptimizedLayout>
    );
}

export default function IndicatorsPage() {
    const [viewModel, setViewModel] = useState<IndicatorsPageViewModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/indicators-list');
                if (res.ok) {
                    const data = await res.json();
                    setViewModel(data);
                }
            } catch (e) {
                console.error('Failed to fetch indicators:', e);
            } finally {
                setLoading(false);
            }
        };
        void fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="市場指標"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />
            {loading || !viewModel ? (
                <IndicatorsSkeleton />
            ) : (
                <IndicatorsPageClient viewModel={viewModel} />
            )}
        </main>
    );
}
