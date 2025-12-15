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
                {/* 3-Tab Navigation - Premium Design with Quantity Hints */}
                <div className="sticky top-14 z-30 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-xl border-b border-white/[0.06] px-4 pt-3 pb-2">
                    <TabsList className="w-full grid grid-cols-3 h-auto p-1.5 bg-neutral-900/60 rounded-xl border border-white/[0.04]">
                        <TabsTrigger
                            value="market"
                            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-neutral-800 data-[state=active]:to-neutral-800/80 data-[state=active]:text-white data-[state=active]:shadow-lg text-neutral-500 rounded-lg text-[11px] font-semibold transition-all duration-200 py-2 flex flex-col items-center justify-center gap-0.5 px-0"
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Gauge className="w-3 h-3" />
                                </div>
                                <span>市場狀態</span>
                            </div>
                            <span className="text-[8px] text-neutral-600 font-normal">5 指標 · 時間軸</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="derivatives"
                            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-neutral-800 data-[state=active]:to-neutral-800/80 data-[state=active]:text-white data-[state=active]:shadow-lg text-neutral-500 rounded-lg text-[11px] font-semibold transition-all duration-200 py-2 flex flex-col items-center justify-center gap-0.5 px-0"
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                    <Flame className="w-3 h-3 text-orange-400" />
                                </div>
                                <span>衍生品風險</span>
                            </div>
                            <span className="text-[8px] text-neutral-600 font-normal">8 指標 · 即時</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="strategies"
                            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-neutral-800 data-[state=active]:to-neutral-800/80 data-[state=active]:text-white data-[state=active]:shadow-lg text-neutral-500 rounded-lg text-[11px] font-semibold transition-all duration-200 py-2 flex flex-col items-center justify-center gap-0.5 px-0"
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                    <BarChart3 className="w-3 h-3 text-blue-400" />
                                </div>
                                <span>策略工具</span>
                            </div>
                            <span className="text-[8px] text-neutral-600 font-normal">進階 · 需經驗</span>
                        </TabsTrigger>
                    </TabsList>
                </div>


                {/* ============================================ */}
                {/* TAB 1: 市場狀態 (Market State) */}
                {/* 目的：回答「現在市場在什麼階段？」 */}
                {/* ============================================ */}
                <TabsContent value="market" className="space-y-8 p-4 min-h-[50vh]">

                    {/* ─────────────────────────────────────────── */}
                    {/* Section 1: 今日市場狀態 - A 級核心指標 */}
                    {/* ─────────────────────────────────────────── */}
                    <section className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-white tracking-tight">今日市場狀態</h2>
                        </div>

                        {/* A級 Card Grid */}
                        <div className="space-y-3">
                            {/* 恐懼貪婪指數 - Hero Card */}
                            {fearGreed && (
                                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-neutral-900/80 via-neutral-900/60 to-neutral-900/40 backdrop-blur-sm">
                                    {/* Subtle glow effect */}
                                    <div className={cn(
                                        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20",
                                        parseInt(fearGreed.value) >= 75 ? "bg-red-500" :
                                            parseInt(fearGreed.value) >= 55 ? "bg-yellow-500" :
                                                parseInt(fearGreed.value) <= 25 ? "bg-green-500" :
                                                    parseInt(fearGreed.value) <= 45 ? "bg-blue-500" :
                                                        "bg-neutral-500"
                                    )} />

                                    <div className="relative p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <span className="text-2xl">😱</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-white">恐懼貪婪指數</span>
                                                        <ExplainTooltip
                                                            term={INDICATOR_KNOWLEDGE.fearGreed.term}
                                                            definition={INDICATOR_KNOWLEDGE.fearGreed.definition}
                                                            explanation={INDICATOR_KNOWLEDGE.fearGreed.interpretation}
                                                            timeline={INDICATOR_KNOWLEDGE.fearGreed.timeline}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] text-neutral-500">市場情緒風向標</span>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[11px] px-2.5 py-1 rounded-full font-medium border",
                                                parseInt(fearGreed.value) >= 75 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                    parseInt(fearGreed.value) >= 55 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                                        parseInt(fearGreed.value) <= 25 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                            parseInt(fearGreed.value) <= 45 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                                "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                                            )}>
                                                {fearGreed.classification}
                                            </span>
                                        </div>

                                        <div className="flex items-end gap-4">
                                            <span className={cn(
                                                "text-5xl font-bold font-mono tracking-tighter",
                                                getFearGreedColor(parseInt(fearGreed.value))
                                            )}>
                                                {fearGreed.value}
                                            </span>
                                            <div className="flex-1 mb-2">
                                                {/* Progress bar */}
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            parseInt(fearGreed.value) >= 75 ? "bg-gradient-to-r from-red-600 to-red-400" :
                                                                parseInt(fearGreed.value) >= 55 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" :
                                                                    parseInt(fearGreed.value) <= 25 ? "bg-gradient-to-r from-green-600 to-green-400" :
                                                                        parseInt(fearGreed.value) <= 45 ? "bg-gradient-to-r from-blue-600 to-blue-400" :
                                                                            "bg-gradient-to-r from-neutral-600 to-neutral-400"
                                                        )}
                                                        style={{ width: `${fearGreed.value}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-1.5 text-[9px] text-neutral-600 font-medium">
                                                    <span>極度恐懼</span>
                                                    <span>極度貪婪</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ETF 資金流 */}
                            <ETFFlowCard />

                            {/* 穩定幣市值 */}
                            <StablecoinCard />
                        </div>
                    </section>

                    {/* ─────────────────────────────────────────── */}
                    {/* Section 2: 機構與週期確認 - B 級輔助指標 */}
                    {/* ─────────────────────────────────────────── */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">機構與週期確認</h2>
                            </div>
                            <span className="text-[10px] text-neutral-600 bg-neutral-800/50 px-2 py-0.5 rounded-full">輔助指標</span>
                        </div>

                        {/* B級 Cards - 2 Column */}
                        <div className="grid grid-cols-2 gap-3">
                            <BubbleIndexCard />
                            <CoinbasePremiumCard />
                        </div>
                    </section>

                    {/* ─────────────────────────────────────────── */}
                    {/* Section 3: 主力動向 - 狀態佐證 */}
                    {/* ─────────────────────────────────────────── */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">主力動向</h2>
                            </div>
                            <span className="text-[10px] text-neutral-600 bg-neutral-800/50 px-2 py-0.5 rounded-full">即時監控</span>
                        </div>


                        <WhaleAlertFeed />
                    </section>

                    {/* ─────────────────────────────────────────── */}
                    {/* Section 4: 深入觀察入口 - 增加可探索感 */}
                    {/* ─────────────────────────────────────────── */}
                    <section className="pt-4 border-t border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-neutral-600 text-xs">🔍</span>
                            <span className="text-[11px] text-neutral-500 font-medium">深入觀察</span>
                            <span className="text-[10px] text-neutral-700">（選看）</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {/* 入口 1: 時間軸 */}
                            <button className="group flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-white/[0.03] hover:bg-neutral-800/50 hover:border-white/[0.06] transition-all duration-200 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <span className="text-sm">📈</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">市場狀態時間軸</span>
                                        <p className="text-[10px] text-neutral-600">查看各指標的歷史判斷順序</p>
                                    </div>
                                </div>
                                <span className="text-neutral-700 group-hover:text-neutral-500 transition-colors text-xs">→</span>
                            </button>

                            {/* 入口 2: 判斷依據 */}
                            <button className="group flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-white/[0.03] hover:bg-neutral-800/50 hover:border-white/[0.06] transition-all duration-200 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <span className="text-sm">🧠</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">為什麼是這個判斷？</span>
                                        <p className="text-[10px] text-neutral-600">了解多項指標如何綜合評估</p>
                                    </div>
                                </div>
                                <span className="text-neutral-700 group-hover:text-neutral-500 transition-colors text-xs">→</span>
                            </button>

                            {/* 入口 3: 歷史相似 (Linked to Market Reviews) */}
                            <Link href="/reviews?tab=featured" className="group flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-white/[0.03] hover:bg-neutral-800/50 hover:border-white/[0.06] transition-all duration-200 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <span className="text-sm">📓</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">市場復盤資料庫</span>
                                        <p className="text-[10px] text-neutral-600">查看相似歷史案例與經驗教訓</p>
                                    </div>
                                </div>
                                <span className="text-neutral-700 group-hover:text-neutral-500 transition-colors text-xs">→</span>
                            </Link>
                        </div>

                        {/* 底部補充說明 */}
                        <p className="text-[10px] text-neutral-700 text-center mt-4">
                            以上為基於多項指標與歷史數據的綜合判斷
                        </p>
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
                <TabsContent value="strategies" className="space-y-8 p-4 min-h-[50vh]">

                    {/* ─────────────────────────────────────────── */}
                    {/* Section 1: 費率套利 */}
                    {/* ─────────────────────────────────────────── */}
                    <section className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-base font-bold text-white tracking-tight">費率套利</h2>
                            </div>
                            <span className="text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                                ⚠️ 需經驗
                            </span>
                        </div>
                        <ArbitrageView />
                    </section>

                    {/* ─────────────────────────────────────────── */}
                    {/* Section 2: 預測市場 */}
                    {/* ─────────────────────────────────────────── */}
                    <section className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">預測市場</h2>
                            </div>
                            <span className="text-[10px] text-neutral-600 bg-neutral-800/50 px-2 py-0.5 rounded-full">娛樂參考</span>
                        </div>

                        {predictLoading ? (
                            <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
                        ) : (
                            <div className="space-y-3">
                                {markets.slice(0, 3).map((market) => (
                                    <Link href={`https://polymarket.com/event/${market.slug}`} target="_blank" key={market.id}>
                                        <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-neutral-900/60 to-neutral-900/30 p-4 hover:border-white/10 transition-all duration-300">
                                            <div className="flex items-center gap-3 mb-3">
                                                {market.icon && <img src={market.icon} className="w-5 h-5 rounded-full ring-1 ring-white/10" />}
                                                <h3 className="text-sm font-medium text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">{market.question}</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(market.outcomes || []).slice(0, 2).map((outcome: any, idx: number) => (
                                                    <div key={idx} className="relative h-7 bg-black/30 rounded-lg overflow-hidden flex items-center px-3 border border-white/[0.04]">
                                                        <div
                                                            className={cn(
                                                                "absolute inset-0 opacity-15",
                                                                idx === 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-rose-500"
                                                            )}
                                                            style={{ width: `${outcome.probability * 100}%` }}
                                                        />
                                                        <div className="relative z-10 flex items-center justify-between w-full text-[11px]">
                                                            <span className="font-medium text-neutral-400">{outcome.name}</span>
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

