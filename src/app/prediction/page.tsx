'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp, BarChart3, Gauge, DollarSign, Bitcoin, Coins, ChevronLeft, Users, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLiff } from '@/components/LiffProvider'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                    <h2 className="text-sm font-bold text-white tracking-wider">Top Traders (Month)</h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Data
                </div>
            </div>

            {whales.map((whale, i) => (
                <div key={i} className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-3 hover:bg-white/5 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-neutral-500 font-mono text-xs w-4">0{i + 1}</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white font-mono">{whale.displayAddress}</span>
                                <span className="text-[10px] text-neutral-500">PnL: <span className="text-green-400 font-mono">+${whale.pnl.toLocaleString()}</span></span>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                            ROI {whale.roi}%
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
                                        {pos.type} {pos.leverage}x
                                    </Badge>
                                    <span className="font-bold text-white">{pos.coin}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-neutral-400">Entry: {pos.entryPrice}</span>
                                    <span className={cn("font-mono font-medium", pos.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                                        {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(1)} u
                                    </span>
                                </div>
                            </div>
                        ))}
                        {whale.positions.length === 0 && (
                            <div className="text-center text-[10px] text-neutral-600 py-1">No active top positions</div>
                        )}
                    </div>
                </div>
            ))}
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
                    <TabsList className="grid w-full grid-cols-3 bg-neutral-900/50 p-0.5 rounded-lg h-9">
                        <TabsTrigger value="market" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5" />
                            市場概況
                        </TabsTrigger>
                        <TabsTrigger value="whales" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1.5">
                            <Radar className="w-3.5 h-3.5 text-purple-400" />
                            巨鯨動向
                        </TabsTrigger>
                        <TabsTrigger value="prediction" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5" />
                            預測市場
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


                    <div className="flex items-center justify-between mb-4 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-yellow-500 rounded-full"></div>
                            <h2 className="text-sm font-bold text-white tracking-wider">熱門板塊 (Hot Sectors)</h2>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-neutral-500 border-neutral-800 bg-neutral-900/50">
                            24h Change
                        </Badge>
                    </div>

                    {marketLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-neutral-900/50 rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {(marketData?.gainers || []).slice(0, 5).map((coin: any, i: number) => (
                                <div key={i} className="group relative overflow-hidden bg-neutral-900/30 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/5 transition-all cursor-default">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className="text-neutral-600 font-mono text-xs w-4">0{i + 1}</span>
                                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
                                            <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-white">{coin.symbol?.toUpperCase()}</span>
                                                <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-white/10 text-white/70 hover:bg-white/20 border-0">
                                                    Rank #{coin.market_cap_rank}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-neutral-400 font-mono">${coin.current_price?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`relative z-10 flex flex-col items-end ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className="text-sm font-bold font-mono flex items-center gap-1">
                                            {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                        </span>
                                        <span className="text-[9px] text-neutral-600 font-mono uppercase">24h Vol</span>
                                    </div>
                                    <div className={`absolute inset-0 opacity-[0.03] ${coin.price_change_percentage_24h >= 0 ? 'bg-gradient-to-r from-transparent to-green-500' : 'bg-gradient-to-r from-transparent to-red-500'}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB 2: Whale Watch */}
                <TabsContent value="whales" className="space-y-4 p-4 min-h-[50vh]">
                    <WhaleWatchList />
                </TabsContent>

                {/* TAB 3: Prediction */}
                <TabsContent value="prediction" className="space-y-4 p-4 min-h-[50vh]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                            <h2 className="text-sm font-bold text-white tracking-wider">Polymarket 預測</h2>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {globalData && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-3 relative overflow-hidden">
                                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Total Volume</span>
                                <span className="text-base font-bold text-white font-mono">${(Number(globalData.totalVolume) / 1000000).toFixed(1)}M</span>
                                <div className="absolute right-0 bottom-0 p-2 opacity-10">
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-3 relative overflow-hidden">
                                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Active Users</span>
                                <span className="text-base font-bold text-white font-mono">24.5k</span>
                                <div className="absolute right-0 bottom-0 p-2 opacity-10">
                                    <Users className="w-8 h-8 text-white" />
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
