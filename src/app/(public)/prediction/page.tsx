'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, BarChart3, Gauge, DollarSign, Bitcoin, Radar, Flame, Percent, BarChart, Calendar, RefreshCcw, ExternalLink } from 'lucide-react'
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
    ETFFlowCard,
    BubbleIndexCard,
    TakerVolumeCard,
    StablecoinCard,
    CoinbasePremiumCard,
} from '@/components/CoinglassWidgets'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'

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
                            "px-2 py-1 rounded-lg text-xs font-medium transition-all",
                            activeToken === 'btc'
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-black/30 text-neutral-500 border border-white/5 hover:bg-white/5"
                        )}
                    >
                        BTC
                    </button>
                    <button
                        onClick={() => setActiveToken('eth')}
                        className={cn(
                            "px-2 py-1 rounded-lg text-xs font-medium transition-all",
                            activeToken === 'eth'
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-black/30 text-neutral-500 border border-white/5 hover:bg-white/5"
                        )}
                    >
                        ETH
                    </button>
                </div>
                <Link
                    href={`https://polymarket.com/event/${data?.slug || 'what-price-will-bitcoin-hit-in-2025'}`}
                    target="_blank"
                    className="text-[10px] text-blue-400/80 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                    資訊來源 Polymarket <ExternalLink className="w-2.5 h-2.5" />
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

    // Default to 'market' (新 Tab 1)
    const [activeTab, setActiveTab] = useState('market')

    useEffect(() => {
        const tabParam = searchParams.get('tab')
        if (tabParam && ['market', 'derivatives', 'strategies'].includes(tabParam)) {
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



    const fetchMarketData = async () => {
        setMarketLoading(true)
        try {
            const [marketRes] = await Promise.all([
                fetch('/api/market').then(r => r.json())
            ])

            if (marketRes.market) setMarketData(marketRes.market)
            if (marketRes.fearGreed) setFearGreed(marketRes.fearGreed)
            if (marketRes.global) setGlobalData(marketRes.global)
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

            <Tabs defaultValue="market" value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* 3-Tab Structure: 市場狀態 / 衍生品風險 / 策略工具 */}
                <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-2 pb-0">
                    <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-neutral-900/50 rounded-lg">
                        <TabsTrigger value="market" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[11px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <Gauge className="w-3.5 h-3.5" />
                            市場狀態
                        </TabsTrigger>
                        <TabsTrigger value="derivatives" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[11px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            衍生品風險
                        </TabsTrigger>
                        <TabsTrigger value="strategies" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[11px] font-medium transition-all py-2 flex items-center justify-center gap-1.5 px-0">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                            策略工具
                        </TabsTrigger>
                    </TabsList>
                </div>


                {/* ============================================ */}
                {/* TAB 1: 市場狀態 (Market State) */}
                {/* 目的：回答「現在市場在什麼階段？」 */}
                {/* ============================================ */}
                <TabsContent value="market" className="space-y-6 p-4 min-h-[50vh]">

                    {/* Section 1: 📊 今日市場狀態 - A 級時間軸指標 */}
                    <section>
                        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            📊 今日市場狀態
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {/* A級：恐懼貪婪指數 */}
                            {fearGreed && (
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">😱</span>
                                            <span className="text-sm font-bold text-white">恐懼貪婪指數</span>
                                            <ExplainTooltip
                                                term={INDICATOR_KNOWLEDGE.fearGreed.term}
                                                definition={INDICATOR_KNOWLEDGE.fearGreed.definition}
                                                explanation={INDICATOR_KNOWLEDGE.fearGreed.interpretation}
                                                timeline={INDICATOR_KNOWLEDGE.fearGreed.timeline}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded font-medium",
                                            parseInt(fearGreed.value) >= 75 ? "bg-red-500/20 text-red-400" :
                                                parseInt(fearGreed.value) >= 55 ? "bg-yellow-500/20 text-yellow-400" :
                                                    parseInt(fearGreed.value) <= 25 ? "bg-green-500/20 text-green-400" :
                                                        parseInt(fearGreed.value) <= 45 ? "bg-blue-500/20 text-blue-400" :
                                                            "bg-neutral-500/20 text-neutral-400"
                                        )}>
                                            {fearGreed.classification}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className={`text-3xl font-bold font-mono ${getFearGreedColor(parseInt(fearGreed.value))}`}>
                                            {fearGreed.value}
                                        </span>
                                        <span className="text-xs text-neutral-500">市場情緒指數</span>
                                    </div>
                                </div>
                            )}

                            {/* A級：ETF 資金流 */}
                            <ETFFlowCard />

                            {/* A級：穩定幣市值 */}
                            <StablecoinCard />
                        </div>
                    </section>

                    {/* Section 2: 🧠 機構與週期 - B 級輔助指標 */}
                    <section>
                        <h2 className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-2">
                            🧠 機構與週期確認
                            <span className="text-[10px] text-neutral-600">（補充資訊）</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <BubbleIndexCard />
                            <CoinbasePremiumCard />
                        </div>
                    </section>

                    {/* Section 3: 🐋 主力動向 - 從獨立 Tab 併入 */}
                    <section>
                        <h2 className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-2">
                            🐋 主力動向
                            <span className="text-[10px] text-neutral-600">（狀態佐證）</span>
                        </h2>
                        <WhaleAlertFeed />
                    </section>

                </TabsContent>

                {/* ============================================ */}
                {/* TAB 2: 衍生品風險 (Derivatives Risk) */}
                {/* 目的：回答「為什麼會震盪？」 */}
                {/* ============================================ */}
                <TabsContent value="derivatives" className="p-4 min-h-[50vh]">
                    <DerivativesView />
                </TabsContent>

                {/* ============================================ */}
                {/* TAB 3: 策略工具 (Strategies) */}
                {/* 給進階用戶，非主線 */}
                {/* ============================================ */}
                <TabsContent value="strategies" className="space-y-6 p-4 min-h-[50vh]">
                    {/* 套利工具 */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-sm font-bold text-white">💰 費率套利</h2>
                            <span className="text-[10px] text-neutral-600 bg-neutral-800 px-1.5 py-0.5 rounded">需經驗</span>
                        </div>
                        <ArbitrageView />
                    </section>

                    {/* 預測市場 */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-bold text-white">🎰 預測市場</h2>
                                <span className="text-[10px] text-neutral-600 bg-neutral-800 px-1.5 py-0.5 rounded">娛樂</span>
                            </div>
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

