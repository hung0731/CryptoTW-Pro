'use client'

import React, { useState, useMemo } from 'react'
import { SkeletonHistoryChart } from '@/components/SkeletonHistoryChart'
import { HistoryChartControls } from '@/components/history/HistoryChartControls'
import { ChartRenderer, ChartType } from '@/components/history/ChartRenderer'
import { useHistoryChartData } from '@/hooks/useHistoryChartData'
import { CHART } from '@/lib/design-tokens'

interface HistoryChartProps {
    type: ChartType;
    symbol: string;
    eventStart: string;
    eventEnd: string;
    daysBuffer?: number;
    className?: string; // Default: CHART.heightDefault set in container
    historySlug?: string;
    focusWindow?: [number, number];
    isPercentage?: boolean;
    newsDate?: string;
    overrideData?: any[];
    overlayType?: 'oi' | 'funding';
}

export function HistoryChart({ type, symbol, eventStart, eventEnd, daysBuffer = 10, className, historySlug, focusWindow, isPercentage = false, newsDate, overrideData, overlayType }: HistoryChartProps) {
    const [viewMode, setViewMode] = useState<'standard' | 'focus'>('standard')

    // 1. Fetch Main Data
    const { data: mainData, loading: mainLoading, getDateFromDaysDiff } = useHistoryChartData({
        type,
        eventStart,
        historySlug,
        viewMode,
        focusWindow,
        isPercentage,
        overrideData
    })

    // 2. Fetch Overlay Data (if requested)
    const { data: overlayDataRaw, loading: overlayLoading } = useHistoryChartData({
        type: overlayType || 'price', // fallback
        eventStart,
        historySlug,
        viewMode,
        focusWindow,
        isPercentage: false,
    })

    // 3. Merge Data
    const mergedData = useMemo(() => {
        if (overrideData) {
            return mainData.map((d: any) => ({
                ...d,
                [`overlay_${overlayType}`]: overlayType === 'oi' ? d.oi : d.fundingRate
            }));
        }

        if (!mainData) return [];
        if (!overlayType || !overlayDataRaw) return mainData;

        return mainData.map((d: any) => {
            const match = overlayDataRaw.find((o: any) => o.date === d.date);
            return {
                ...d,
                [`overlay_${overlayType}`]: match ? (overlayType === 'oi' ? match.oi : match.fundingRate) : null
            };
        });
    }, [mainData, overlayDataRaw, overlayType, overrideData]);

    const loading = mainLoading || (!!overlayType && overlayLoading);

    if (loading) {
        return <SkeletonHistoryChart />
    }

    if (!mergedData || mergedData.length === 0) return <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">尚無數據</div>


    return (
        <div className={`w-full relative ${className || CHART.heightDefault}`}>
            <HistoryChartControls
                viewMode={viewMode}
                setViewMode={setViewMode}
                focusWindow={focusWindow}
            />

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none opacity-[0.03]">
                <img
                    src="/logo.svg"
                    alt="CryptoTW Watermark"
                    className="w-48 h-48 grayscale"
                />
            </div>

            <div className="w-full h-full relative z-10">
                <ChartRenderer
                    type={type}
                    data={mergedData}
                    symbol={symbol}
                    eventStart={eventStart}
                    newsDate={newsDate}
                    isPercentage={isPercentage}
                    overlayType={overlayType}
                    viewMode={viewMode}
                    focusWindow={focusWindow}
                    getDateFromDaysDiff={getDateFromDaysDiff}
                />
            </div>
        </div>
    )
}
