'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { PredictionCard } from '@/components/PredictionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp, BarChart3, Gauge, DollarSign, Bitcoin, Coins, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GlobalData {
    totalMarketCap: string
    totalVolume: string
    btcDominance: string
    btcMarketCap: string
    stablecoinMarketCap: string
    stablecoinDominance: string
}

export default function DataPage() {
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
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center justify-start">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400 hover:text-white rounded-full h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="Logo" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <Tabs defaultValue="market" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-900">
                        <TabsTrigger value="market">市場異動</TabsTrigger>
                        <TabsTrigger value="prediction">預測市場</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Market Data */}
                    <TabsContent value="market" className="space-y-4 mt-6">
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
                                {/* Stablecoin */}
                                {globalData && (
                                    <div className="bg-neutral-900/50 rounded-lg border border-white/5 p-3 sm:col-span-1 col-span-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Coins className="w-4 h-4 text-green-500" />
                                            <span className="text-xs text-neutral-500">穩定幣市佔</span>
                                        </div>
                                        <div className="text-xl font-bold font-mono text-green-400">{globalData.stablecoinDominance}%</div>
                                        <div className="text-xs text-neutral-400">${globalData.stablecoinMarketCap}</div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Ranking Title */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">24h 漲跌排行</h2>
                            <span className="text-xs text-neutral-500">OKX</span>
                        </div>

                        {marketLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full bg-neutral-900 rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {/* Gainers */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-green-500 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> 漲幅榜
                                    </h3>
                                    <div className="bg-neutral-900/50 rounded-lg border border-white/5 divide-y divide-white/5">
                                        {marketData?.gainers.map((item: any, i: number) => (
                                            <div key={item.symbol} className="flex items-center justify-between px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500 w-4">{i + 1}</span>
                                                    <span className="font-medium text-sm">{item.symbol}</span>
                                                </div>
                                                <span className="text-green-500 text-sm font-mono">
                                                    +{parseFloat(item.priceChangePercent).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Losers */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-red-500 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 rotate-180" /> 跌幅榜
                                    </h3>
                                    <div className="bg-neutral-900/50 rounded-lg border border-white/5 divide-y divide-white/5">
                                        {marketData?.losers.map((item: any, i: number) => (
                                            <div key={item.symbol} className="flex items-center justify-between px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500 w-4">{i + 1}</span>
                                                    <span className="font-medium text-sm">{item.symbol}</span>
                                                </div>
                                                <span className="text-red-500 text-sm font-mono">
                                                    {parseFloat(item.priceChangePercent).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center text-xs text-neutral-600 mt-4">
                            數據來源：OKX Spot API
                        </div>
                    </TabsContent>

                    {/* Tab 2: Prediction Data */}
                    <TabsContent value="prediction" className="space-y-4 mt-6">
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">熱門預測</h2>
                            <span className="text-xs text-neutral-500">Polymarket</span>
                        </div>

                        {predictLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full bg-neutral-900 rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {markets.map((market) => {
                                    const isGroup = market.type === 'group' && market.groupOutcomes
                                    const topOutcome = isGroup
                                        ? market.groupOutcomes.reduce((a: any, b: any) => parseFloat(a.probability) > parseFloat(b.probability) ? a : b)
                                        : null
                                    const probability = isGroup ? topOutcome?.probability : market.probability
                                    const prob = parseFloat(probability || '0')

                                    // For single events: Green if >50%, Red if <50%
                                    // For group events: Blue (neutral, showing top option)
                                    const chartColor = isGroup ? "#60a5fa" : (prob > 50 ? "#4ade80" : "#f87171")
                                    const textColorClass = isGroup ? "text-blue-400" : (prob > 50 ? "text-green-400" : "text-red-400")

                                    // For donut chart
                                    const circumference = 2 * Math.PI * 40
                                    const strokeDasharray = `${(prob / 100) * circumference} ${circumference}`

                                    return (
                                        <div key={market.id} className="bg-neutral-900/50 rounded-lg border border-white/5 p-4">
                                            <div className="flex items-center gap-4">
                                                {/* Donut Chart */}
                                                <div className="relative w-20 h-20 shrink-0">
                                                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                                                        {/* Background circle */}
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            fill="none"
                                                            stroke="#262626"
                                                            strokeWidth="8"
                                                        />
                                                        {/* Progress circle */}
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            fill="none"
                                                            stroke={chartColor}
                                                            strokeWidth="8"
                                                            strokeLinecap="round"
                                                            strokeDasharray={strokeDasharray}
                                                        />
                                                    </svg>
                                                    {/* Center text */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className={`text-lg font-bold font-mono ${textColorClass}`}>
                                                            {prob.toFixed(0)}%
                                                        </span>
                                                        <span className="text-[9px] text-neutral-500 text-center px-1 leading-tight">
                                                            {isGroup ? '最高' : (prob > 50 ? '會' : '不會')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-medium text-neutral-200 line-clamp-2 leading-snug mb-2">
                                                        {market.title}
                                                    </h3>
                                                    {isGroup && topOutcome ? (
                                                        <div className="text-xs text-blue-400 bg-blue-500/10 rounded px-2 py-1 inline-block border border-blue-500/20">
                                                            📊 {topOutcome.label}
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="text-green-400">✓ {prob.toFixed(0)}% 會發生</span>
                                                            <span className="text-neutral-500">|</span>
                                                            <span className="text-red-400">✗ {(100 - prob).toFixed(0)}% 不會</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="text-xs text-neutral-600 text-center mt-4">
                            數據來源：Polymarket（僅供參考，不構成投資建議）
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <BottomNav />
        </main>
    )
}


