import { useState, useEffect, useCallback, useRef } from 'react';
import { IndicatorStory, ZONE_COLORS, getZoneLabel } from '@/lib/indicator-stories';

export interface ChartDataPoint {
    date: number;
    value: number;
    price?: number;
}

interface UseIndicatorChartReturn {
    chartData: ChartDataPoint[];
    loading: boolean;
    timeRange: '1M' | '3M' | '1Y';
    setTimeRange: (range: '1M' | '3M' | '1Y') => void;
    liveCurrentValue: number | null;
    liveZone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed' | null;
    lastUpdated: Date | null;
    currentValue: number;
    currentZone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed';
    zoneColors: typeof ZONE_COLORS['fear'];
    zoneLabel: string;
}

export function useIndicatorChart(story: IndicatorStory): UseIndicatorChartReturn {
    const [timeRange, setTimeRange] = useState<'1M' | '3M' | '1Y'>('3M');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    // Live data state
    const [liveCurrentValue, setLiveCurrentValue] = useState<number | null>(null);
    const [liveZone, setLiveZone] = useState<'fear' | 'lean_fear' | 'lean_greed' | 'greed' | null>(null);

    // Auto-refresh state
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60s

    const isFixedAxis = story.chart.yAxisModel.type === 'fixed';

    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);

        const endpoint = story.chart.api.endpoint;
        const params = new URLSearchParams({
            range: timeRange,
            ...(story.chart.api.params as Record<string, string>)
        });

        try {
            // Parallel fetch: Indicator Data + BTC Price (if not fixed axis)
            const indicatorFetch = fetch(`${endpoint}?${params.toString()}`).then(res => res.json());
            const btcPriceFetch = !isFixedAxis
                ? fetch(`/api/coinglass/fear-greed?range=${timeRange}`).then(res => res.json())
                : Promise.resolve(null);

            const [indicatorData, btcData] = await Promise.all([indicatorFetch, btcPriceFetch]);

            if (!indicatorData.history) {
                console.warn(`No history data found for ${story.slug}`);
                setChartData([]);
                return;
            }

            // Set live values from API
            if (indicatorData.current?.value !== undefined) {
                const value = indicatorData.current.value;
                setLiveCurrentValue(value);

                // Zone calculation
                const zones = story.chart.zones;
                if (value <= zones.fear.max) {
                    setLiveZone('fear');
                } else if (value <= zones.leanFear.max) {
                    setLiveZone('lean_fear');
                } else if (value <= zones.leanGreed.max) {
                    setLiveZone('lean_greed');
                } else {
                    setLiveZone('greed');
                }
            }

            // Merge BTC Price Data
            if (btcData?.history && btcData.history.length > 0) {
                const priceMap = new Map<number, number>();
                btcData.history.forEach((item: { date: number; price: number }) => {
                    const dayKey = Math.floor(item.date / 86400000) * 86400000;
                    priceMap.set(dayKey, item.price);
                });

                const mergedData = indicatorData.history.map((item: ChartDataPoint) => {
                    const dayKey = Math.floor(item.date / 86400000) * 86400000;
                    let price = priceMap.get(dayKey);

                    // Fallback to nearest price if exact match missing
                    if (!price) {
                        const keys = Array.from(priceMap.keys()).sort((a, b) =>
                            Math.abs(a - item.date) - Math.abs(b - item.date)
                        );
                        if (keys.length > 0) {
                            price = priceMap.get(keys[0]);
                        }
                    }
                    return { ...item, price: price || 0 };
                });
                setChartData(mergedData);
            } else {
                setChartData(indicatorData.history);
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error(`Failed to fetch chart data for ${story.slug}:`, err);
            setChartData([]);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [story.slug, timeRange, story.chart.api.endpoint, story.chart.api.params, isFixedAxis, story.chart.zones]);

    // Initial load & Polling
    useEffect(() => {
        void fetchData(true);
        refreshIntervalRef.current = setInterval(() => {
            void fetchData(false);
        }, AUTO_REFRESH_INTERVAL);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [fetchData, AUTO_REFRESH_INTERVAL]);

    // Derived values
    const currentValue = liveCurrentValue ?? story.currentValue ?? 0;
    const currentZone = liveZone ?? story.zone;
    const zoneColors = ZONE_COLORS[currentZone];
    const zoneLabel = getZoneLabel(story.id, currentZone);

    return {
        chartData,
        loading,
        timeRange,
        setTimeRange,
        liveCurrentValue,
        liveZone,
        lastUpdated,
        currentValue,
        currentZone,
        zoneColors,
        zoneLabel
    };
}
