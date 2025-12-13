'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, BarChart3, Gauge, DollarSign, Bitcoin, Radar, Flame, Percent, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLiff } from '@/components/LiffProvider'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BullBearIndex, LiquidationWaterfall, FundingRateRankings, LongShortRatio, LiquidationHeatmap } from '@/components/CoinglassWidgets'

interface GlobalData {
    totalMarketCap: string
    totalVolume: string
    btcDominance: string
    btcMarketCap: string
    stablecoinMarketCap: string
    stablecoinDominance: string
    categories?: any[]
}

// Whale Watch Component
function WhaleWatchList() {
    const [whales, setWhales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWhales = async () => {
            try {
                const res = await fetch('/api/market/whales')
                const data = await res.json()
                if (data.whales) setWhales(data.whales)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchWhales()
    }, [])

    if (loading) return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full bg-neutral-900/50 rounded-xl" />)}
        </div>
    )

    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">本月頂尖交易者</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    即時數據
                </div>
            </div>

            {whales.map((whale, i) => {
                // Format PnL with thousand separators
                const formatPnl = (pnl: number) => {
                    if (pnl >= 1000000) return `${(pnl / 1000000).toFixed(1)}M`
                    if (pnl >= 1000) return `${(pnl / 1000).toFixed(0)}K`
                    return pnl.toFixed(0)
                }

                // Format entry price smartly based on value
                const formatPrice = (price: number) => {
                    if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 1 })
                    if (price >= 100) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
                    if (price >= 1) return price.toFixed(2)
                    return price.toFixed(4)
                }

                return (
                    <div key={i} className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-3 hover:bg-white/5 transition-all">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-500 font-mono text-xs w-4">0{i + 1}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white font-mono">{whale.displayAddress}</span>
                                    <span className="text-[10px] text-neutral-500">盈虧: <span className={whale.pnl >= 0 ? 'text-green-400' : 'text-red-400'} style={{ fontFamily: 'monospace' }}>{whale.pnl >= 0 ? '+' : ''}${formatPnl(whale.pnl)}</span></span>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                                報酬率 {parseFloat(whale.roi).toFixed(1)}%
                            </Badge>
                        </div>

                        {/* Positions */}
                        <div className="space-y-2">
                            {whale.positions.map((pos: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs bg-black/20 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "text-[9px] px-1 h-4 rounded border-0",
                                            pos.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        )}>
                                            {pos.type === 'LONG' ? '做多' : '做空'} {pos.leverage}x
                                        </Badge>
                                        <span className="font-bold text-white">{pos.coin}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-neutral-400">入場價: ${formatPrice(pos.entryPrice)}</span>
                                        <span className={cn("font-mono font-medium", pos.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                                            {pos.pnl >= 0 ? '+' : ''}{pos.pnl >= 1000 ? `${(pos.pnl / 1000).toFixed(1)}K` : pos.pnl.toFixed(0)} u
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {whale.positions.length === 0 && (
                                <div className="text-center text-[10px] text-neutral-600 py-1">目前無主要倉位</div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
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
                        🔶 BTC
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
                        💎 ETH
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
            <h2 className="text-lg font-bold text-white">
                {activeToken === 'btc' ? 'BTC' : 'ETH'} 2025 價格預測
            </h2>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
                    <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
                </div>
            ) : data ? (
                <>
                    {/* Top 3 Predictions */}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-4 space-y-3">
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
                        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3">
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
                        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3">
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

export default function DataPage() {
    const { profile } = useLiff()
    const [activeTab, setActiveTab] = useState('market')

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
            const res = await fetch('/api/market')
            const data = await res.json()
            if (data.market) setMarketData(data.market)
            if (data.fearGreed) setFearGreed(data.fearGreed)
            if (data.global) setGlobalData(data.global)
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
        if (activeTab === 'market') fetchMarketData()
        else fetchPredictionMarkets()
    }

    const isLoading = activeTab === 'market' ? marketLoading : predictLoading

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

            <Tabs defaultValue="market" className="w-full" onValueChange={setActiveTab}>
                {/* Custom Tabs List */}
                <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-2 pb-0">
                    <TabsList className="grid w-full grid-cols-6 bg-neutral-900/50 p-0.5 rounded-lg h-9">
                        <TabsTrigger value="market" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            市場
                        </TabsTrigger>
                        <TabsTrigger value="liquidation" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            清算
                        </TabsTrigger>
                        <TabsTrigger value="funding" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1">
                            <Percent className="w-3 h-3 text-yellow-400" />
                            費率
                        </TabsTrigger>
                        <TabsTrigger value="longshort" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1">
                            <BarChart className="w-3 h-3 text-blue-400" />
                            多空
                        </TabsTrigger>
                        <TabsTrigger value="whales" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1">
                            <Radar className="w-3 h-3 text-purple-400" />
                            巨鯨
                        </TabsTrigger>
                        <TabsTrigger value="prediction" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1">
                            <Gauge className="w-3 h-3" />
                            預測
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB 1: Market Data */}
                <TabsContent value="market" className="space-y-4 p-4 min-h-[50vh]">
                    {/* Global Stats Grid */}
                    {!marketLoading && (fearGreed || globalData) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {/* Fear & Greed */}
                            {fearGreed && (
                                <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Gauge className="w-4 h-4 text-neutral-500" />
                                        <span className="text-xs text-neutral-500">恐懼貪婪</span>
                                    </div>
                                    <div className={`text-xl font-bold font-mono ${getFearGreedColor(parseInt(fearGreed.value))}`}>
                                        {fearGreed.value}
                                    </div>
                                    <div className="text-xs text-neutral-400">{fearGreed.classification}</div>
                                </div>
                            )}
                            {/* Total Market Cap */}
                            {globalData && (
                                <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4 text-neutral-500" />
                                        <span className="text-xs text-neutral-500">總市值</span>
                                    </div>
                                    <div className="text-xl font-bold font-mono text-white">${globalData.totalMarketCap}</div>
                                    <div className="text-xs text-neutral-400">24h 量 ${globalData.totalVolume}</div>
                                </div>
                            )}
                            {/* BTC Dominance */}
                            {globalData && (
                                <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bitcoin className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs text-neutral-500">BTC 市佔</span>
                                    </div>
                                    <div className="text-xl font-bold font-mono text-orange-400">{globalData.btcDominance}%</div>
                                    <div className="text-xs text-neutral-400">${globalData.btcMarketCap}</div>
                                </div>
                            )}
                        </div>
                    )}


                    <h2 className="text-lg font-bold text-white mt-6 mb-4">熱門幣種</h2>

                    {marketLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
                            <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Gainers */}
                            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4">
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
                            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4">
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
                </TabsContent>

                {/* TAB: Liquidation */}
                <TabsContent value="liquidation" className="space-y-4 p-4 min-h-[50vh]">
                    <LiquidationWaterfall />
                    <div className="border-t border-white/5 my-6"></div>
                    <LiquidationHeatmap />
                </TabsContent>

                {/* TAB: Funding Rate */}
                <TabsContent value="funding" className="space-y-4 p-4 min-h-[50vh]">
                    <FundingRateRankings />
                </TabsContent>

                {/* TAB: Long/Short Ratio */}
                <TabsContent value="longshort" className="space-y-4 p-4 min-h-[50vh]">
                    <LongShortRatio />
                </TabsContent>

                {/* TAB: Whale Watch */}
                <TabsContent value="whales" className="space-y-4 p-4 min-h-[50vh]">
                    <WhaleWatchList />
                </TabsContent>

                {/* TAB 3: Prediction */}
                <TabsContent value="prediction" className="space-y-4 p-4 min-h-[50vh]">
                    {/* BTC/ETH Price Prediction Section */}
                    <CryptoPricePrediction />

                    {/* Separator */}
                    <div className="border-t border-white/5 my-6"></div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">其他預測市場</h2>
                    </div>

                    {/* Stats Cards */}
                    {globalData && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-3 relative overflow-hidden">
                                <span className="text-[10px] text-neutral-500 tracking-wider block mb-1">24小時交易量</span>
                                <span className="text-base font-bold text-white font-mono">${globalData.totalVolume}</span>
                                <div className="absolute right-0 bottom-0 p-2 opacity-10">
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-3 relative overflow-hidden">
                                <span className="text-[10px] text-neutral-500 tracking-wider block mb-1">追蹤市場</span>
                                <span className="text-base font-bold text-white font-mono">{markets.length} 個</span>
                                <div className="absolute right-0 bottom-0 p-2 opacity-10">
                                    <Gauge className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    {predictLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full bg-neutral-900/50 rounded-xl" />
                            <Skeleton className="h-24 w-full bg-neutral-900/50 rounded-xl" />
                            <Skeleton className="h-24 w-full bg-neutral-900/50 rounded-xl" />
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {markets.map((market) => (
                                <Link href={`https://polymarket.com/event/${market.slug}`} target="_blank" key={market.id}>
                                    <div className="group bg-neutral-900/30 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 p-1.5 shrink-0 border border-white/10">
                                                    <img src={market.icon || '/logo.svg'} className="w-full h-full object-contain opacity-80" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-neutral-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                                        {market.question}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outcomes */}
                                        <div className="space-y-1.5">
                                            {(market.outcomes || []).slice(0, 2).map((outcome: any, idx: number) => (
                                                <div key={idx} className="relative h-8 bg-black/40 rounded-lg overflow-hidden flex items-center px-3 border border-white/5">
                                                    <div
                                                        className={`absolute inset-0 opacity-20 ${idx === 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                                        style={{ width: `${outcome.probability * 100}%` }}
                                                    />
                                                    <div className="relative z-10 flex items-center justify-between w-full text-xs">
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
                </TabsContent>
            </Tabs>

            <BottomNav />
        </main>
    )
}
