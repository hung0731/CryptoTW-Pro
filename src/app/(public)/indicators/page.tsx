'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS } from '@/lib/design-tokens';
import { INDICATOR_STORIES, ZONE_COLORS, getZoneLabel, IndicatorStory } from '@/lib/indicator-stories';
import { PageHeader } from '@/components/PageHeader';
import { AISummaryCard } from '@/components/ui/AISummaryCard';

// 按熱門程度排序（最知名/最常用的在前）
const POPULARITY_ORDER = [
    'fear-greed',       // 1. FGI - 最知名
    'funding-rate',     // 2. 資金費率 - 交易者必看
    'liquidation',      // 3. 清算 - 熱門話題
    'open-interest',    // 4. OI - 衍生品核心
    'long-short-ratio', // 5. 多空比 - 散戶指標
    'etf-flow',         // 6. ETF 流 - 機構動向
    'coinbase-premium', // 7. CB 溢價 - 區域需求
    'futures-basis',    // 8. 基差 - 結構指標
    'stablecoin-supply',// 9. 穩定幣 - 長期指標
    'seasonality',      // 10. 季節性 - 歷史規律
    'halving-cycles',   // 11. 減半週期 - 宏觀對比
    'divergence-screener', // 12. 多空掃描 - 交易機會
];

// 即時數據類型
interface LiveIndicatorData {
    value: number;
    zone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed';
    headline: string;
    loading: boolean;
}

// 根據指標的 zones 配置計算 zone
function calculateZone(value: number, story: IndicatorStory): 'fear' | 'lean_fear' | 'lean_greed' | 'greed' {
    const zones = story.chart.zones;
    if (value <= zones.fear.max) return 'fear';
    if (value <= zones.leanFear.max) return 'lean_fear';
    if (value <= zones.leanGreed.max) return 'lean_greed';
    return 'greed';
}

// 格式化數值顯示
function formatValue(value: number, story: IndicatorStory): string {
    const format = story.chart.valueFormat;
    const unit = story.chart.unit;
    if (format === 'percent') return `${value.toFixed(3)}%`;
    if (format === 'ratio') return value.toFixed(2);
    if (unit === 'M') return `$${value.toFixed(0)}M`;
    if (unit === 'B') return `$${value.toFixed(1)}B`;
    return value.toFixed(0);
}

// 根據指標和 zone 生成一句話解讀
function getZoneDescription(id: string, zone: string): string {
    const descriptions: Record<string, Record<string, string>> = {
        'fear-greed': {
            fear: '市場恐慌，可留意歷史低點行為',
            lean_fear: '情緒偏謹慎，觀望氣氛濃厚',
            lean_greed: '情緒偏樂觀，短線追價需謹慎',
            greed: '市場過熱，歷史顯示回調機率上升',
        },
        'funding-rate': {
            fear: '空頭擁擠，潛在軋空風險',
            lean_fear: '資金費率偏負，空方佔優',
            lean_greed: '資金費率正常偏多',
            greed: '多頭過熱，爆倉燃料累積中',
        },
        'liquidation': {
            fear: '清算清淡，波動偏低',
            lean_fear: '清算正常，市場相對平穩',
            lean_greed: '清算增加，短線波動放大',
            greed: '清算劇烈，市場正在出清槓桿',
        },
        'open-interest': {
            fear: 'OI 偏低，做市觀望中',
            lean_fear: 'OI 正常，無明顯異常',
            lean_greed: 'OI 偏高，槓桿累積中',
            greed: 'OI 過熱，潛在連環爆倉風險',
        },
        'long-short-ratio': {
            fear: '散戶極端偏空，反向指標留意',
            lean_fear: '散戶偏空，市場觀望',
            lean_greed: '散戶偏多，短線追價需謹慎',
            greed: '散戶極端偏多，反向指標警戒',
        },
        'etf-flow': {
            fear: '機構大量撤資，需關注支撐',
            lean_fear: '機構淨流出，買盤減弱',
            lean_greed: '機構持續買入中',
            greed: '機構大量流入，支撐強勁',
        },
        'coinbase-premium': {
            fear: '美國需求疲軟，折價明顯',
            lean_fear: '溢價正常偏低',
            lean_greed: '美國買盤積極',
            greed: '美國需求強勁，溢價拉高',
        },
        'futures-basis': {
            fear: '期貨折價，市場悲觀',
            lean_fear: '基差正常偏低',
            lean_greed: '基差正常偏高',
            greed: '期貨高溢價，套利空間大',
        },
        'stablecoin-supply': {
            fear: '穩定幣供應下降，資金外流',
            lean_fear: '供應正常偏低',
            lean_greed: '供應正常偏高',
            greed: '穩定幣供應充裕，潛在買盤',
        },
    };
    return descriptions[id]?.[zone] || '—';
}

// Premium indicators that require Pro membership
const PRO_INDICATORS = ['etf-flow', 'coinbase-premium', 'futures-basis', 'stablecoin-supply'];

// 入口卡片組件
function IndicatorEntryCard({
    story,
    liveData,
}: {
    story: IndicatorStory;
    liveData?: LiveIndicatorData;
}) {
    const zone = liveData?.zone ?? story.zone;
    const zoneColors = ZONE_COLORS[zone];
    const zoneLabel = getZoneLabel(story.id, zone);
    const description = getZoneDescription(story.id, zone);
    const isProFeature = PRO_INDICATORS.includes(story.id);

    return (
        <Link href={`/indicators/${story.slug}`} className="block group">
            <div className={cn(
                CARDS.secondary,
                "transition-colors duration-0 overflow-hidden relative",
                isProFeature && "border-white/10"
            )}>
                <div className="flex flex-col gap-3">
                    {/* Header Row: Name vs Status (Right Anchor) */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className={cn(TYPOGRAPHY.cardTitle, "mt-0.5")}>{story.name}</h3>
                            {isProFeature && (
                                <span className="bg-amber-500/10 text-amber-500 text-[8px] font-bold px-1 py-0.5 rounded border border-amber-500/20">
                                    PRO
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap border",
                                zoneColors.bg, zoneColors.text, zoneColors.border
                            )}>
                                {liveData?.loading ? '...' : zoneLabel}
                            </span>
                        </div>
                    </div>

                    {/* Bottom Row: Description vs Value (Diagonal Balance) */}
                    <div className="flex items-end justify-between gap-4">
                        <p className={cn("text-xs truncate text-neutral-500 max-w-[65%]", COLORS.textSecondary)}>
                            {liveData?.loading ? '分析中...' : description}
                        </p>

                        <div className="flex items-center gap-1 shrink-0">
                            {liveData?.loading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                            ) : liveData?.value !== undefined ? (
                                <span className={cn("text-lg font-mono font-bold leading-none", zoneColors.text)}>
                                    {formatValue(liveData.value, story)}
                                </span>
                            ) : null}
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-400 mb-0.5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function IndicatorsPage() {
    const [liveData, setLiveData] = useState<Record<string, LiveIndicatorData>>({});
    const [aiSummary, setAiSummary] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(true);

    // Split indicators into Tools and Metrics
    const alphaTools = useMemo(() => {
        return ['seasonality', 'halving-cycles', 'divergence-screener']
            .map(id => INDICATOR_STORIES.find(s => s.id === id))
            .filter(Boolean) as IndicatorStory[];
    }, []);

    const marketMetrics = useMemo(() => {
        const metricIds = POPULARITY_ORDER.filter(id => !['seasonality', 'halving-cycles', 'divergence-screener'].includes(id));
        return metricIds
            .map(id => INDICATOR_STORIES.find(s => s.id === id))
            .filter(Boolean) as IndicatorStory[];
    }, []);

    useEffect(() => {
        // 初始化所有指標為 loading 狀態
        const initialState: Record<string, LiveIndicatorData> = {};
        marketMetrics.forEach(story => {
            initialState[story.id] = {
                value: 0,
                zone: story.zone,
                headline: '載入中...',
                loading: true,
            };
        });
        setLiveData(initialState);

        // 並行獲取所有指標的即時數據
        marketMetrics.forEach(story => {
            const endpoint = story.chart.api.endpoint;
            const params = new URLSearchParams({
                range: '1M',
                ...(story.chart.api.params as Record<string, string>)
            });

            fetch(`${endpoint}?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    if (data.current?.value !== undefined) {
                        const value = data.current.value;
                        const zone = calculateZone(value, story);
                        const zoneLabel = getZoneLabel(story.id, zone);

                        setLiveData(prev => ({
                            ...prev,
                            [story.id]: {
                                value,
                                zone,
                                headline: `${zoneLabel}（${formatValue(value, story)}）`,
                                loading: false,
                            }
                        }));
                    } else {
                        // API 沒有返回 current，使用靜態數據
                        setLiveData(prev => ({
                            ...prev,
                            [story.id]: {
                                value: story.currentValue ?? 0,
                                zone: story.zone,
                                headline: story.positionHeadline,
                                loading: false,
                            }
                        }));
                    }
                })
                .catch(() => {
                    // 錯誤時使用靜態數據
                    setLiveData(prev => ({
                        ...prev,
                        [story.id]: {
                            value: story.currentValue ?? 0,
                            zone: story.zone,
                            headline: story.positionHeadline,
                            loading: false,
                        }
                    }));
                });
        });
    }, [marketMetrics]);

    // 當指標數據載入完成後，生成 AI 總結 (10 分鐘快取)
    useEffect(() => {
        const CACHE_KEY = 'indicator-ai-summary';
        const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

        const allLoaded = Object.values(liveData).every(d => !d.loading);
        const hasData = Object.keys(liveData).length > 0;

        if (allLoaded && hasData && aiLoading) {
            // Check cache first
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { summary, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setAiSummary(summary);
                        setAiLoading(false);
                        return;
                    }
                } catch (e) {
                    // Invalid cache, continue to fetch
                }
            }

            const fgi = liveData['fear-greed'];
            const funding = liveData['funding-rate'];
            const lsRatio = liveData['long-short-ratio'];
            const liquidation = liveData['liquidation'];

            // Only call if we have the key indicators
            if (fgi && funding && lsRatio) {
                // Use IIFE for async operations
                (async () => {
                    try {
                        // First fetch BTC price data
                        let btcPrice = undefined;
                        try {
                            // Fetch current price and 24h change from existing API
                            const priceRes = await fetch('/api/coinglass/btc-price');
                            const priceData = await priceRes.json();

                            // Fetch kline data for different timeframes
                            const klineRes = await fetch('/api/binance/klines?symbol=BTCUSDT&interval=1h&limit=24');
                            const klineData = await klineRes.json();

                            const currentPrice = priceData.price || 0;
                            const change24h = priceData.priceChange24h || 0;

                            // Calculate changes from kline data if available
                            let change1h = 0, change4h = 0, change12h = 0;
                            if (klineData.data && klineData.data.length > 0) {
                                const klines = klineData.data;
                                const currentClose = parseFloat(klines[klines.length - 1]?.close || currentPrice);

                                if (klines.length >= 1) {
                                    const price1hAgo = parseFloat(klines[klines.length - 1]?.open || currentClose);
                                    change1h = ((currentClose - price1hAgo) / price1hAgo) * 100;
                                }
                                if (klines.length >= 4) {
                                    const price4hAgo = parseFloat(klines[klines.length - 4]?.open || currentClose);
                                    change4h = ((currentClose - price4hAgo) / price4hAgo) * 100;
                                }
                                if (klines.length >= 12) {
                                    const price12hAgo = parseFloat(klines[klines.length - 12]?.open || currentClose);
                                    change12h = ((currentClose - price12hAgo) / price12hAgo) * 100;
                                }
                            }

                            btcPrice = {
                                current: currentPrice,
                                change15m: change1h / 4, // Approximate
                                change1h,
                                change4h,
                                change12h,
                                change24h
                            };
                        } catch (e) {
                            console.error('Failed to fetch BTC price:', e);
                        }

                        const res = await fetch('/api/ai/indicator-summary', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fearGreedIndex: { value: fgi.value, zone: fgi.zone },
                                fundingRate: funding.value / 100, // Convert to decimal
                                longShortRatio: lsRatio.value,
                                liquidation: {
                                    total: (liquidation?.value ?? 0) * 1_000_000, // Assume M
                                    long: (liquidation?.value ?? 0) * 500_000,
                                    short: (liquidation?.value ?? 0) * 500_000,
                                },
                                oiChange24h: liveData['open-interest']?.value,
                                etfNetFlow: liveData['etf-flow']?.value,
                                btcPrice
                            })
                        });

                        const data = await res.json();
                        if (data.summary) {
                            setAiSummary(data.summary);
                            // Save to cache
                            localStorage.setItem(CACHE_KEY, JSON.stringify({
                                summary: data.summary,
                                timestamp: Date.now()
                            }));
                        }
                    } catch (e) {
                        console.error('Failed to fetch AI summary:', e);
                    } finally {
                        setAiLoading(false);
                    }
                })();
            } else {
                setAiLoading(false);
            }
        }
    }, [liveData, aiLoading]);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="市場指標"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />

            <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-8">
                {/* AI 總結卡片 */}
                <AISummaryCard
                    summary={aiSummary || '正在分析各項市場數據...'}
                    source="AI 市場觀察"
                    loading={aiLoading}
                />

                {/* Alpha Tools Section (New) */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className={cn(TYPOGRAPHY.sectionLabel)}>Alpha 工具箱</h2>
                        <span className="text-[10px] text-neutral-500 font-mono">POWERED BY CryptoTW</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {alphaTools.map(story => (
                            <Link key={story.id} href={`/indicators/${story.slug}`} className="group block">
                                <div className={cn(
                                    "h-full p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] hover:bg-white/[0.03] transition-colors flex flex-col justify-between"
                                )}>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                {/* Simple Icon Mapping based on ID */}
                                                {story.id === 'seasonality' && <span className="text-indigo-400 text-lg">📅</span>}
                                                {story.id === 'halving-cycles' && <span className="text-orange-400 text-lg">⏳</span>}
                                                {story.id === 'divergence-screener' && <span className="text-cyan-400 text-lg">🔍</span>}
                                            </div>
                                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">ALPHA</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{story.name}</h3>
                                    </div>
                                    <div className="mt-3 flex items-center text-[10px] text-neutral-600 font-medium group-hover:text-neutral-400">
                                        立即使用 <ChevronRight className="w-3 h-3 ml-0.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Market Metrics Section (Existing) */}
                <section>
                    <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3 px-1")}>市場數據指標</h2>
                    <div className="space-y-3">
                        {marketMetrics.map((story) => (
                            <IndicatorEntryCard
                                key={story.id}
                                story={story}
                                liveData={liveData[story.id]}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

