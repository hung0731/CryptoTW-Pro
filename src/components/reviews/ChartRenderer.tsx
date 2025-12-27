'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Line, Bar } from 'recharts'
import { SkeletonReviewChart } from '@/components/SkeletonReviewChart'

// Dynamically import chart variants (Lazy Load)
const PriceChart = dynamic(() => import('@/components/charts/review/PriceChart').then(mod => mod.PriceChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const FlowChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.FlowChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const FgiChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.FgiChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const FundingChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.FundingChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const LiquidationChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.LiquidationChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const LongShortChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.LongShortChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const BasisChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.BasisChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const PremiumChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.PremiumChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const StablecoinChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.StablecoinChart), { ssr: false, loading: () => <SkeletonReviewChart /> })
const OpenInterestChart = dynamic(() => import('@/components/charts/review/ReviewChartVariants').then(mod => mod.OpenInterestChart), { ssr: false, loading: () => <SkeletonReviewChart /> })

export type ChartType = 'price' | 'flow' | 'oi' | 'supply' | 'fgi' | 'funding' | 'liquidation' | 'longShort' | 'basis' | 'premium' | 'stablecoin';

interface ChartRendererProps {
    type: ChartType;
    data: any[];
    symbol: string;
    eventStart: string;
    newsDate?: string;
    isPercentage?: boolean;
    overlayType?: 'oi' | 'funding';
    viewMode: 'standard' | 'focus';
    focusWindow?: [number, number];
    getDateFromDaysDiff: (diff: number) => string;
}

export function ChartRenderer({
    type,
    data,
    symbol,
    eventStart,
    newsDate,
    isPercentage = false,
    overlayType,
    viewMode,
    focusWindow,
    getDateFromDaysDiff
}: ChartRendererProps) {
    const gradientId = `gradient-${type}-${symbol}`

    // Render Overlay Helper
    const renderOverlay = () => {
        if (!overlayType) return null;
        if (overlayType === 'oi') {
            return (
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="overlay_oi"
                    stroke="#f59e0b" // Orange
                    strokeWidth={2}
                    dot={false}
                    opacity={0.8}
                />
            );
        }
        if (overlayType === 'funding') {
            return (
                <Bar
                    yAxisId="right"
                    dataKey="overlay_funding"
                    fill="#eab308"
                    opacity={0.3}
                />
            );
        }
        return null;
    };

    switch (type) {
        case 'price':
        case 'supply':
            return (
                <PriceChart
                    data={data}
                    gradientId={gradientId}
                    eventStart={eventStart}
                    newsDate={newsDate}
                    isPercentage={isPercentage}
                    overlayType={overlayType}
                    viewMode={viewMode}
                    focusWindow={focusWindow}
                    getDateFromDaysDiff={getDateFromDaysDiff}
                    renderOverlay={renderOverlay}
                />
            )
        case 'flow':
            return <FlowChart data={data} />
        case 'fgi':
            return <FgiChart data={data} gradientId={gradientId} />
        case 'funding':
            return <FundingChart data={data} />
        case 'liquidation':
            return <LiquidationChart data={data} />
        case 'longShort':
            return <LongShortChart data={data} gradientId={gradientId} />
        case 'basis':
            return <BasisChart data={data} gradientId={gradientId} />
        case 'premium':
            return <PremiumChart data={data} />
        case 'stablecoin':
            return <StablecoinChart data={data} gradientId={gradientId} />
        case 'oi':
        default:
            return (
                <OpenInterestChart
                    data={data}
                    gradientId={gradientId}
                    viewMode={viewMode}
                    focusWindow={focusWindow}
                    getDateFromDaysDiff={getDateFromDaysDiff}
                />
            )
    }
}
