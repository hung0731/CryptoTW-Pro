'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/design-tokens';

// 指標 slug → API 端點映射
const INDICATOR_API_MAP: Record<string, { endpoint: string; valueKey: string }> = {
    'funding-rate': { endpoint: '/api/coinglass/funding-rate-history', valueKey: 'fundingRate' },
    'liquidation': { endpoint: '/api/coinglass/liquidation-history', valueKey: 'longLiquidationUsd' },
    'open-interest': { endpoint: '/api/coinglass/open-interest-history', valueKey: 'openInterest' },
    'long-short-ratio': { endpoint: '/api/coinglass/long-short-history', valueKey: 'longShortRatio' },
    'fear-greed': { endpoint: '/api/coinglass/fear-greed', valueKey: 'value' },
    'etf-flow': { endpoint: '/api/coinglass/etf-flow', valueKey: 'totalNetflow' },
    'stablecoin-supply': { endpoint: '/api/coinglass/stablecoin-marketcap', valueKey: 'totalMarketCap' },
};

interface IndicatorMiniChartProps {
    indicatorSlug: string;
    eventStartDate: string; // YYYY-MM-DD
    eventEndDate: string;   // YYYY-MM-DD
    className?: string;
}

interface DataPoint {
    date: number;
    value: number;
}

export function IndicatorMiniChart({
    indicatorSlug,
    eventStartDate,
    eventEndDate,
    className
}: IndicatorMiniChartProps) {
    const [data, setData] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 計算事件持續天數（加前後緩衝）
    const daysRange = useMemo(() => {
        const start = new Date(eventStartDate);
        const end = new Date(eventEndDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(diffDays + 10, 14); // 至少 14 天
    }, [eventStartDate, eventEndDate]);

    useEffect(() => {
        const apiConfig = INDICATOR_API_MAP[indicatorSlug];
        if (!apiConfig) {
            setError('不支援的指標');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`${apiConfig.endpoint}?days=${daysRange}`);
                if (!res.ok) throw new Error('API error');
                const json = await res.json();

                // 解析資料（不同 API 格式可能不同）
                let chartData: DataPoint[] = [];
                if (Array.isArray(json.data)) {
                    chartData = json.data.map((item: Record<string, unknown>) => ({
                        date: item.timestamp || item.date || item.t,
                        value: Number(item[apiConfig.valueKey] || item.value || 0)
                    })).filter((d: DataPoint) => !isNaN(d.value));
                }

                setData(chartData.slice(-30)); // 只取最近 30 筆
                setLoading(false);
            } catch (err) {
                setError('載入失敗');
                setLoading(false);
            }
        };

        void fetchData();
    }, [indicatorSlug, daysRange]);

    // 計算 SVG 路徑
    const { path, stats } = useMemo(() => {
        if (data.length < 2) return { path: '', stats: null };

        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const width = 120;
        const height = 32;
        const padding = 2;

        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
            return `${x},${y}`;
        });

        // 找出事件期間的最高點
        const eventStart = new Date(eventStartDate).getTime();
        const eventEnd = new Date(eventEndDate).getTime();
        const eventData = data.filter(d => d.date >= eventStart && d.date <= eventEnd);
        const maxInEvent = eventData.length > 0 ? Math.max(...eventData.map(d => d.value)) : max;

        return {
            path: `M${points.join(' L')}`,
            stats: {
                max: maxInEvent,
                isPositive: data[data.length - 1]?.value > data[0]?.value
            }
        };
    }, [data, eventStartDate, eventEndDate]);

    if (loading) {
        return (
            <div className={cn("h-10 bg-neutral-800/50 rounded animate-pulse", className)} />
        );
    }

    if (error || data.length < 2) {
        return null; // 靜默失敗，不顯示圖表
    }

    // 判斷趨勢顏色
    const trendColor = stats?.isPositive ? '#22c55e' : '#ef4444';

    return (
        <div className={cn("relative", className)}>
            <svg
                viewBox="0 0 120 32"
                className="w-full h-8"
                preserveAspectRatio="none"
            >
                {/* 區域填充 */}
                <defs>
                    <linearGradient id={`grad-${indicatorSlug}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* 填充區域 */}
                <path
                    d={`${path} L120,32 L0,32 Z`}
                    fill={`url(#grad-${indicatorSlug})`}
                />

                {/* 線條 */}
                <path
                    d={path}
                    fill="none"
                    stroke={trendColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
