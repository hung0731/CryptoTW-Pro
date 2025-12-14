'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, BarChart3, Gauge, DollarSign, Bitcoin, Radar, Flame, Percent, BarChart, Calendar, RefreshCcw } from 'lucide-react'
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
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3 space-y-3">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveToken('btc')}
                        className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium transition-all",
                            activeToken === 'btc'
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : "bg-black/30 text-neutral-500 border border-white/5 hover:bg-white/5"
                        )}
                    >
                        BTC
                    </button>
                    <button
                        onClick={() => setActiveToken('eth')}
                        className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium transition-all",
                            activeToken === 'eth'
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-black/30 text-neutral-500 border border-white/5 hover:bg-white/5"
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
                    Polymarket →
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <Skeleton className="h-24 w-full bg-black/30 rounded-lg" />
            ) : data ? (
                <div className="space-y-3">
                    {/* Top 3 Predictions - Compact */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-neutral-500">2025 價格預測 (最可能達到)</p>
                        {data.topPredictions?.slice(0, 3).map((target: any, i: number) => {
                            const prob = target.probability * 100
                            const probDisplay = prob < 10 ? prob.toFixed(1) : prob.toFixed(0)
                            const barWidth = Math.max(prob, 3)

                            return (
                                <div key={i} className="space-y-0.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className={cn(
                                            "font-medium",
                                            target.direction === 'up' ? 'text-green-400' : 'text-red-400'
                                        )}>
                                            {target.direction === 'up' ? '↑' : '↓'} {target.label}
                                        </span>
                                        <span className="font-mono font-bold text-white">{probDisplay}%</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
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

                    {/* Bullish/Bearish Grid - Compact */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <span className="text-green-400 text-[10px]">↑</span>
                                <span className="text-[10px] text-green-400">看漲</span>
                            </div>
                            <div className="space-y-1">
                                {data.bullish?.slice(0, 4).map((t: any, i: number) => {
                                    const prob = t.probability * 100
                                    return (
                                        <div key={i} className="flex items-center justify-between text-[10px]">
                                            <span className="text-neutral-400">{t.label}</span>
                                            <span className="font-mono text-white">{prob < 10 ? prob.toFixed(1) : prob.toFixed(0)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <span className="text-red-400 text-[10px]">↓</span>
                                <span className="text-[10px] text-red-400">看跌</span>
                            </div>
                            <div className="space-y-1">
                                {data.bearish?.slice(0, 4).map((t: any, i: number) => {
                                    const prob = t.probability * 100
                                    return (
                                        <div key={i} className="flex items-center justify-between text-[10px]">
                                            <span className="text-neutral-400">{t.label}</span>
                                            <span className="font-mono text-white">{prob < 10 ? prob.toFixed(1) : prob.toFixed(0)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-neutral-500 py-4 text-xs">無法載入數據</div>
            )}
        </div>
    )
}

import { Suspense } from 'react'
import { DerivativesView, SmartMoneyView } from '@/components/DataDashboards'
import { ArbitrageView } from '@/components/ArbitrageWidgets'
import { useSearchParams } from 'next/navigation'

function DataPageContent() {
    const { profile } = useLiff()
    const searchParams = useSearchParams()

    // Default to 'overview', or 'arbitrage' if specified in URL
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const tabParam = searchParams.get('tab')
        if (tabParam && ['overview', 'derivatives', 'smartmoney', 'arbitrage'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [searchParams])

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

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* 3-Tab Structure */}
                <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-2 pb-0">
                    <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-neutral-900/50 rounded-lg">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <Gauge className="w-3.5 h-3.5" />
                            總覽
                        </TabsTrigger>
                        <TabsTrigger value="derivatives" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            合約
                        </TabsTrigger>
                        <TabsTrigger value="smartmoney" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <Radar className="w-3.5 h-3.5 text-purple-400" />
                            巨鯨
                        </TabsTrigger>
                        <TabsTrigger value="arbitrage" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <RefreshCcw className="w-3.5 h-3.5 text-green-400" />
                            費率
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB 1: Market Overview */}
                <TabsContent value="overview" className="space-y-5 p-4 min-h-[50vh]">

                    {/* Section: 市場狀態 - 3 Column Grid */}
                    {globalData && fearGreed && (
                        <section>
                            <h2 className="text-sm font-medium text-neutral-500 mb-3">市場狀態</h2>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Gauge className="w-3 h-3 text-neutral-500" />
                                        <span className="text-[10px] text-neutral-500">恐慌指數</span>
                                    </div>
                                    <div className={`text-xl font-bold font-mono ${getFearGreedColor(parseInt(fearGreed.value))}`}>
                                        {fearGreed.value}
                                    </div>
                                    <div className="text-[10px] text-neutral-500">{fearGreed.classification}</div>
                                </div>
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Bitcoin className="w-3 h-3 text-orange-500" />
                                        <span className="text-[10px] text-neutral-500">BTC 市佔</span>
                                    </div>
                                    <div className="text-lg font-bold font-mono text-orange-400">{globalData.btcDominance}%</div>
                                    <div className="text-[10px] text-neutral-500">${globalData.btcMarketCap}</div>
                                </div>
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <DollarSign className="w-3 h-3 text-neutral-500" />
                                        <span className="text-[10px] text-neutral-500">總市值</span>
                                    </div>
                                    <div className="text-lg font-bold font-mono text-white">${globalData.totalMarketCap}</div>
                                    <div className="text-[10px] text-neutral-500">Vol ${globalData.totalVolume}</div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Section: 今日重點 */}
                    {calendarEvents.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-medium text-neutral-500">今日重點事件</h2>
                                <Link href="/calendar" className="text-[10px] text-neutral-500 hover:text-white transition-colors">完整日曆 →</Link>
                            </div>
                            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3">
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
                        </section>
                    )}

                    {/* Section: 漲跌榜 */}
                    <section>
                        <h2 className="text-sm font-medium text-neutral-500 mb-3">漲跌排行</h2>
                        {marketLoading ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-40 w-full bg-neutral-900/50 rounded-xl" />
                                <Skeleton className="h-40 w-full bg-neutral-900/50 rounded-xl" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {/* Gainers */}
                                <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                        <TrendingUp className="w-3 h-3 text-green-400" />
                                        <span className="text-xs font-medium text-green-400">漲幅榜</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {(marketData?.gainers || []).slice(0, 5).map((coin: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-neutral-600 font-mono w-3">{i + 1}</span>
                                                    <span className="font-medium text-white">{coin.symbol?.toUpperCase()}</span>
                                                </div>
                                                <span className="font-mono font-bold text-green-400">
                                                    +{Math.abs(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Losers */}
                                <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                        <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                                        <span className="text-xs font-medium text-red-400">跌幅榜</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {(marketData?.losers || []).slice(0, 5).map((coin: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-neutral-600 font-mono w-3">{i + 1}</span>
                                                    <span className="font-medium text-white">{coin.symbol?.toUpperCase()}</span>
                                                </div>
                                                <span className="font-mono font-bold text-red-400">
                                                    {(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Section: 價格預測 */}
                    <section>
                        <h2 className="text-sm font-medium text-neutral-500 mb-3">價格預測</h2>
                        <CryptoPricePrediction />
                    </section>

                    {/* Section: 預測市場 */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-medium text-neutral-500">預測市場</h2>
                        </div>
                        {predictLoading ? (
                            <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
                        ) : (
                            <div className="space-y-2">
                                {markets.slice(0, 3).map((market) => (
                                    <Link href={`https://polymarket.com/event/${market.slug}`} target="_blank" key={market.id}>
                                        <div className="group bg-neutral-900/50 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                {market.icon && <img src={market.icon} className="w-4 h-4 rounded-full" />}
                                                <h3 className="text-xs font-medium text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">{market.question}</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {(market.outcomes || []).slice(0, 2).map((outcome: any, idx: number) => (
                                                    <div key={idx} className="relative h-5 bg-black/40 rounded overflow-hidden flex items-center px-2 border border-white/5">
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
                    </section>

                </TabsContent>

                {/* TAB 2: Derivatives */}
                <TabsContent value="derivatives" className="p-4 min-h-[50vh]">
                    <DerivativesView />
                </TabsContent>

                {/* TAB 3: Smart Money */}
                <TabsContent value="smartmoney" className="p-4 min-h-[50vh]">
                    <SmartMoneyView />
                </TabsContent>

                {/* TAB 4: Arbitrage */}
                <TabsContent value="arbitrage" className="p-4 min-h-[50vh]">
                    <ArbitrageView />
                </TabsContent>

            </Tabs>

            <BottomNav />
        </main>
    )
}

export default function DataPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <DataPageContent />
        </Suspense>
    )
}

