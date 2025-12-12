'use client'

import React, { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { PredictionCard } from '@/components/PredictionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp, BarChart3, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DataPage() {
    const [activeTab, setActiveTab] = useState('market')

    // Market Data State
    const [marketData, setMarketData] = useState<{ gainers: any[], losers: any[] } | null>(null)
    const [marketLoading, setMarketLoading] = useState(true)
    const [fearGreed, setFearGreed] = useState<{ value: string, classification: string } | null>(null)

    // Prediction Data State
    const [markets, setMarkets] = useState<any[]>([])
    const [predictLoading, setPredictLoading] = useState(true)

    const fetchMarketData = async () => {
        setMarketLoading(true)
        try {
            // Fetch OKX market data
            const res = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT')
            const json = await res.json()

            if (json.code === '0' && json.data) {
                // Filter USDT pairs only
                const usdtPairs = json.data.filter((t: any) => t.instId.endsWith('-USDT'))

                // Calculate 24h change and sort
                const withChange = usdtPairs.map((t: any) => {
                    const last = parseFloat(t.last)
                    const open = parseFloat(t.open24h)
                    const change = open > 0 ? ((last - open) / open * 100) : 0
                    return {
                        symbol: t.instId.replace('-USDT', ''),
                        lastPrice: t.last,
                        priceChangePercent: change.toFixed(2)
                    }
                })

                // Filter out stablecoins
                const ignored = ['USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP']
                const filtered = withChange.filter((t: any) => !ignored.includes(t.symbol))

                filtered.sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))

                setMarketData({
                    gainers: filtered.slice(0, 5),
                    losers: filtered.slice(-5).reverse()
                })
            }

            // Fetch Fear & Greed Index
            const fgRes = await fetch('https://api.alternative.me/fng/')
            const fgData = await fgRes.json()
            if (fgData.data && fgData.data.length > 0) {
                setFearGreed(fgData.data[0])
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
            if (data.markets) {
                setMarkets(data.markets)
            }
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
                <div className="flex items-center justify-between px-6 h-16 max-w-5xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">市場數據</h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="text-neutral-400 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
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
                        {/* Fear & Greed Index */}
                        {!marketLoading && fearGreed && (
                            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                        <Gauge className="w-5 h-5 text-neutral-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-neutral-500">恐慌貪婪指數</div>
                                        <div className="text-sm text-neutral-400">{fearGreed.classification}</div>
                                    </div>
                                </div>
                                <div className={`text-3xl font-bold font-mono ${getFearGreedColor(parseInt(fearGreed.value))}`}>
                                    {fearGreed.value}
                                </div>
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

                    {/* Tab 2: Prediction Data (Original Content) */}
                    <TabsContent value="prediction" className="space-y-8 mt-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white">熱門預測</h2>
                            <p className="text-neutral-400 text-sm">來自 Polymarket 的即時機率數據。</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {predictLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-32 w-full bg-neutral-900 rounded-xl" />
                                        <Skeleton className="h-4 w-3/4 bg-neutral-900" />
                                        <Skeleton className="h-8 w-full bg-neutral-900" />
                                    </div>
                                ))
                            ) : (
                                markets.map((market) => (
                                    <PredictionCard
                                        key={market.id}
                                        id={market.id}
                                        title={market.title}
                                        image={market.image}
                                        probability={market.probability}
                                        volume={market.volume}
                                        type={market.type || 'single'}
                                        groupOutcomes={market.groupOutcomes}
                                    />
                                ))
                            )}
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-12 py-8 border-t border-white/5 space-y-4">
                            {/* ... Disclaimer content ... */}
                            <h3 className="text-sm font-bold text-neutral-300">關於 Polymarket</h3>
                            <div className="text-xs text-neutral-500 space-y-4 leading-relaxed">
                                <p>
                                    本頁面數據引用自去中心化預測市場平台 <span className="text-neutral-400">Polymarket</span>，僅供資訊研究與學術參考，不代表本站立場。
                                    本站與該平台無任何商業合作或代理關係，亦不提供任何投資建議。
                                </p>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                                    <p className="font-bold text-red-400">⚠️ 重要法律提示</p>
                                    <p className="text-red-300/80">
                                        根據中華民國《公職人員選舉罷免法》及相關法令，預測市場可能涉及博弈或影響選舉之爭議。
                                        使用者若欲前往該平台進行任何操作，請務必自行了解並遵守您所在地之當地法律法規，以免觸法。
                                        切勿以身試法，本站不承擔任何法律責任。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <BottomNav />
        </main>
    )
}


