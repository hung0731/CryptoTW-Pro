'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, BarChart3, Gauge, DollarSign, Bitcoin, Radar, Flame, Percent, BarChart, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLiff } from '@/components/LiffProvider'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    LiquidationWaterfall,
    FundingRateRankings,
    WhaleAlertFeed,
    WhalePositionsList,
    ExchangeTransparency,
    LongShortRatio,
    EconomicCalendar
} from '@/components/CoinglassWidgets'
import { ExplainTooltip } from '@/components/ExplainTooltip'

interface GlobalData {
    totalMarketCap: string
    totalVolume: string
    btcDominance: string
    btcMarketCap: string
    stablecoinMarketCap: string
    stablecoinDominance: string
    categories?: any[]
}


// Crypto Price Prediction Component with Tabs (BTC / ETH)
function CryptoPricePrediction() {
    const [activeToken, setActiveToken] = useState<'btc' | 'eth'>('btc')
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/prediction/btc-price?crypto=${activeToken}`)
                const json = await res.json()
                if (!json.error) setData(json)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [activeToken])

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                    <button
                        onClick={() => setActiveToken('btc')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            activeToken === 'btc'
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : "bg-neutral-900/50 text-neutral-500 border border-white/5 hover:bg-white/5"
                        )}
                    >
                        BTC
                    </button>
                    <button
                        onClick={() => setActiveToken('eth')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            activeToken === 'eth'
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-neutral-900/50 text-neutral-500 border border-white/5 hover:bg-white/5"
                        )}
                    >
                        ETH
                    </button>
                </div>
                <Link
                    href={`https://polymarket.com/event/${data?.slug || 'what-price-will-bitcoin-hit-in-2025'}`}
                    target="_blank"
                    className="text-[10px] text-neutral-500 hover:text-white transition-colors"
                >
                    在 Polymarket 查看 →
                </Link>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {activeToken === 'btc' ? 'BTC' : 'ETH'} 2025 價格預測
                <ExplainTooltip
                    term="Polymarket 預測"
                    definition="來自去中心化預測市場的機率分佈。"
                    explanation={
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>真金白銀</strong>：此機率是由交易者用錢押注出來的，通常比分析師更準。</li>
                            <li><strong>解讀機率</strong>：若機率 {'>'} 50%，代表市場認為發生機會很大。</li>
                        </ul>
                    }
                />
            </h2>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
                    <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
                </div>
            ) : data ? (
                <>
                    {/* Top 3 Predictions */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 space-y-3">
                        <p className="text-xs text-neutral-500 mb-3">最可能達到的價格</p>
                        {data.topPredictions?.slice(0, 3).map((target: any, i: number) => {
                            // Format probability - show 1 decimal for low values
                            const prob = target.probability * 100
                            const probDisplay = prob < 10 ? prob.toFixed(1) : prob.toFixed(0)
                            // For very low probabilities, use minimum bar width
                            const barWidth = Math.max(prob, 3)

                            return (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={cn(
                                            "font-medium flex items-center gap-1",
                                            target.direction === 'up' ? 'text-green-400' : 'text-red-400'
                                        )}>
                                            {target.direction === 'up' ? '↑' : '↓'} {target.label}
                                        </span>
                                        <span className="font-mono font-bold text-white">{probDisplay}%</span>
                                    </div>
                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                target.direction === 'up' ? 'bg-green-500' : 'bg-red-500'
                                            )}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* All Targets - 2 Column */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Bullish */}
                        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                <span className="text-green-400 text-xs">↑</span>
                                <span className="text-xs font-medium text-green-400">看漲目標</span>
                            </div>
                            <div className="space-y-1.5">
                                {data.bullish?.slice(0, 6).map((t: any, i: number) => {
                                    const prob = t.probability * 100
                                    return (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-400">{t.label}</span>
                                            <span className="font-mono text-white">{prob < 10 ? prob.toFixed(1) : prob.toFixed(0)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Bearish */}
                        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                <span className="text-red-400 text-xs">↓</span>
                                <span className="text-xs font-medium text-red-400">看跌目標</span>
                            </div>
                            <div className="space-y-1.5">
                                {data.bearish?.slice(0, 6).map((t: any, i: number) => {
                                    const prob = t.probability * 100
                                    return (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-400">{t.label}</span>
                                            <span className="font-mono text-white">{prob < 10 ? prob.toFixed(1) : prob.toFixed(0)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-neutral-500 py-8">無法載入數據</div>
            )}
        </div>
    )
}

import { DerivativesView, SmartMoneyView } from '@/components/DataDashboards'

export default function DataPage() {
    const { profile } = useLiff()
    const [activeTab, setActiveTab] = useState('overview')

    // Market Data State
    const [marketData, setMarketData] = useState<{ gainers: any[], losers: any[] } | null>(null)
    const [marketLoading, setMarketLoading] = useState(true)
    const [fearGreed, setFearGreed] = useState<{ value: string, classification: string } | null>(null)
    const [globalData, setGlobalData] = useState<GlobalData | null>(null)

    // Prediction Data State
    const [markets, setMarkets] = useState<any[]>([])
    const [predictLoading, setPredictLoading] = useState(true)

    // Calendar Snapshot for Overview
    const [calendarEvents, setCalendarEvents] = useState<any[]>([])

    const fetchMarketData = async () => {
        setMarketLoading(true)
        try {
            const [marketRes, calendarRes] = await Promise.all([
                fetch('/api/market').then(r => r.json()),
                fetch('/api/coinglass/calendar').then(r => r.json())
            ])

            if (marketRes.market) setMarketData(marketRes.market)
            if (marketRes.fearGreed) setFearGreed(marketRes.fearGreed)
            if (marketRes.global) setGlobalData(marketRes.global)

            if (calendarRes.calendar?.events) {
                // Get today's high importance events
                setCalendarEvents(calendarRes.calendar.events.filter((e: any) => e.importance >= 2).slice(0, 3))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setMarketLoading(false)
        }
    }

    const fetchPredictionMarkets = async () => {
        setPredictLoading(true)
        try {
            const res = await fetch('/api/prediction/markets?limit=20')
            const data = await res.json()
            if (data.markets) setMarkets(data.markets)
        } catch (e) {
            console.error(e)
        } finally {
            setPredictLoading(false)
        }
    }

    useEffect(() => {
        fetchMarketData()
        fetchPredictionMarkets()
    }, [])

    const handleRefresh = () => {
        fetchMarketData()
        fetchPredictionMarkets()
    }

    const isLoading = marketLoading

    // Fear & Greed color
    const getFearGreedColor = (value: number) => {
        if (value <= 25) return 'text-red-500'
        if (value <= 45) return 'text-orange-500'
        if (value <= 55) return 'text-yellow-500'
        if (value <= 75) return 'text-lime-500'
        return 'text-green-500'
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader />

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                {/* 3-Tab Structure */}
                <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-2 pb-0">
                    <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-neutral-900/50 rounded-lg">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[11px] font-medium transition-all py-2 flex items-center justify-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5" />
                            市場總覽
                        </TabsTrigger>
                        <TabsTrigger value="derivatives" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[11px] font-medium transition-all py-2 flex items-center justify-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            合約數據
                        </TabsTrigger>
                        <TabsTrigger value="smartmoney" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[11px] font-medium transition-all py-2 flex items-center justify-center gap-1.5">
                            <Radar className="w-3.5 h-3.5 text-purple-400" />
                            聰明錢
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB 1: Market Overview */}
                <TabsContent value="overview" className="space-y-5 p-4 min-h-[50vh]">

                    {/* 1. Critical Stats Marquee */}
                    {globalData && fearGreed && (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-2 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <Gauge className="w-3 h-3 text-neutral-500" />
                                    <span className="text-[10px] text-neutral-500">恐慌指數</span>
                                    <ExplainTooltip
                                        term="恐慌貪婪指數"
                                        definition="衡量市場情緒的溫度計 (0-100)。"
                                        explanation={
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>&lt; 20 (極度恐慌)</strong>：非理性拋售，通常是買點。</li>
                                                <li><strong>&gt; 80 (極度貪婪)</strong>：FOMO 情緒高漲，隨時可能回調。</li>
                                            </ul>
                                        }
                                    />
                                </div>
                                <div className={`text-lg font-bold font-mono ${getFearGreedColor(parseInt(fearGreed.value))}`}>
                                    {fearGreed.value}
                                </div>
                            </div>
                            <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-2 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <Bitcoin className="w-3 h-3 text-orange-500" />
                                    <span className="text-[10px] text-neutral-500">BTC Dominance</span>
                                    <ExplainTooltip
                                        term="BTC 市占率 (Dominance)"
                                        definition="比特幣市值佔加密貨幣總市值的百分比。"
                                        explanation={
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>上升趨勢</strong>：資金回流比特幣，山寨幣 (Altcoins) 通常會失血下跌。</li>
                                                <li><strong>下降趨勢</strong>：比特幣橫盤或獲利了結，資金流向山寨幣 (Alt Season)。</li>
                                            </ul>
                                        }
                                    />
                                </div>
                                <div className="text-lg font-bold font-mono text-white">{globalData.btcDominance}%</div>
                            </div>
                            <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-2 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <BarChart3 className="w-3 h-3 text-blue-500" />
                                    <span className="text-[10px] text-neutral-500">Long/Short</span>
                                    <ExplainTooltip
                                        term="多空比 (Long/Short)"
                                        definition="市場做多與做空的人數/資金比例。"
                                        explanation={
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>高於 2.0</strong>：散戶極度看多，通常是反指標。</li>
                                                <li><strong>低於 0.8</strong>：散戶極度看空，容易軋空上漲。</li>
                                            </ul>
                                        }
                                    />
                                </div>
                                <div className="text-lg font-bold font-mono text-white">--</div> {/* Handled by widget separately if needed */}
                            </div>
                        </div>
                    )}

                    {/* 2. Important Events (Calendar Snippet) */}
                    {calendarEvents.length > 0 && (
                        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <h3 className="text-sm font-bold text-white">今日重點</h3>
                                </div>
                                <Link href="/calendar" className="text-[10px] text-neutral-500 hover:text-white transition-colors">更多 →</Link>
                            </div>
                            <div className="space-y-2">
                                {calendarEvents.map((e, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-neutral-500 font-mono">{e.time}</span>
                                            <span className="text-neutral-300">{e.country} {e.event}</span>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(e.importance)].map((_, idx) => (
                                                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Gainers/Losers (Existing) */}
                    {marketLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
                            <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Gainers */}
                            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-400">漲幅榜</span>
                                </div>
                                <div className="space-y-2">
                                    {(marketData?.gainers || []).slice(0, 5).map((coin: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-neutral-600 font-mono text-xs w-4">{i + 1}</span>
                                                <span className="text-sm font-medium text-white">{coin.symbol?.toUpperCase()}</span>
                                            </div>
                                            <span className="text-sm font-mono font-bold text-green-400">
                                                +{Math.abs(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(2)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Losers */}
                            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                                    <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                                    <span className="text-sm font-medium text-red-400">跌幅榜</span>
                                </div>
                                <div className="space-y-2">
                                    {(marketData?.losers || []).slice(0, 5).map((coin: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-neutral-600 font-mono text-xs w-4">{i + 1}</span>
                                                <span className="text-sm font-medium text-white">{coin.symbol?.toUpperCase()}</span>
                                            </div>
                                            <span className="text-sm font-mono font-bold text-red-400">
                                                {(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(2)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Prediction Markets (Polymarket) */}
                    <div className="space-y-4 pt-4">
                        <CryptoPricePrediction />

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <h2 className="text-lg font-bold text-white">預測市場 (Polymarket)</h2>
                        </div>

                        {predictLoading ? (
                            <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
                        ) : (
                            <div className="grid gap-3">
                                {markets.slice(0, 3).map((market) => (
                                    <Link href={`https://polymarket.com/event/${market.slug}`} target="_blank" key={market.id}>
                                        <div className="group bg-neutral-900/50 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2">
                                                    {market.icon && <img src={market.icon} className="w-5 h-5 rounded-full" />}
                                                    <h3 className="text-sm font-medium text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">{market.question}</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                {(market.outcomes || []).slice(0, 2).map((outcome: any, idx: number) => (
                                                    <div key={idx} className="relative h-6 bg-black/40 rounded overflow-hidden flex items-center px-2 border border-white/5">
                                                        <div className={`absolute inset-0 opacity-20 ${idx === 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${outcome.probability * 100}%` }} />
                                                        <div className="relative z-10 flex items-center justify-between w-full text-[10px]">
                                                            <span className="font-medium text-neutral-300">{outcome.name}</span>
                                                            <span className="font-mono font-bold text-white">{(outcome.probability * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 2: Derivatives */}
                <TabsContent value="derivatives" className="p-4 min-h-[50vh]">
                    <DerivativesView />
                </TabsContent>

                {/* TAB 3: Smart Money */}
                <TabsContent value="smartmoney" className="p-4 min-h-[50vh]">
                    <SmartMoneyView />
                </TabsContent>

            </Tabs>

            <BottomNav />
        </main>
    )
}
