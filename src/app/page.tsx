'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { useLiff } from '@/components/LiffProvider'
import {
    TrendingUp, FileText, BarChart3, Calendar, Users,
    ChevronRight, Gauge, DollarSign, Bitcoin, Bell, Settings, Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIMarketPulse } from '@/components/AIMarketPulse'
import { LiquidationSummary, FundingSummary, LongShortSummary } from '@/components/CoinglassWidgets'

export default function HomePage() {
    const { profile, isLoading: isAuthLoading } = useLiff()
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState<any[]>([])
    const [marketData, setMarketData] = useState<any>(null)
    const [fearGreed, setFearGreed] = useState<any>(null)
    const [globalData, setGlobalData] = useState<any>(null)
    const [predictions, setPredictions] = useState<any[]>([])
    const [calendar, setCalendar] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [artRes, mktRes, predRes, calRes] = await Promise.all([
                    fetch('/api/content?limit=3'),
                    fetch('/api/market'),
                    fetch('/api/prediction/markets?limit=3'),
                    fetch('/api/coinglass/calendar')
                ])

                const artData = await artRes.json()
                const mktData = await mktRes.json()
                const predData = await predRes.json()
                const calData = await calRes.json()

                setArticles(artData.content || [])
                if (mktData.market) setMarketData(mktData.market)
                if (mktData.fearGreed) setFearGreed(mktData.fearGreed)
                if (mktData.global) setGlobalData(mktData.global)
                setPredictions(predData.markets || [])
                setCalendar(calData.calendar?.events || [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Fear & Greed color
    const getFearGreedColor = (value: number) => {
        if (value <= 25) return 'text-red-500'
        if (value <= 45) return 'text-orange-500'
        if (value <= 55) return 'text-yellow-500'
        if (value <= 75) return 'text-lime-500'
        return 'text-green-500'
    }

    if (isAuthLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <img src="/logo.svg" className="h-8 w-auto opacity-50 animate-pulse" />
        </div>
    }

    return (
        <main className="min-h-screen font-sans bg-black text-white pb-24">
            <PageHeader showLogo />

            <div className="mt-4 px-4 space-y-6">

                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {profile?.pictureUrl ? (
                            <img
                                src={profile.pictureUrl}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border border-white/20"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                <span className="text-lg">👋</span>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-neutral-500">歡迎回來</p>
                            <h1 className="text-base font-bold text-white">
                                {profile?.displayName || 'Pro 會員'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/profile" className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-neutral-400" />
                        </Link>
                        <Link href="/profile" className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-neutral-400" />
                        </Link>
                    </div>
                </div>

                {/* AI Pulse Widget */}
                <AIMarketPulse />

                {/* Market Stats Grid */}
                <section>
                    <h2 className="text-sm font-medium text-neutral-500 mb-3">📊 市場一眼看</h2>
                    {loading ? (
                        <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-20 bg-neutral-900/50" />
                            <Skeleton className="h-20 bg-neutral-900/50" />
                            <Skeleton className="h-20 bg-neutral-900/50" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {/* Fear & Greed */}
                            {fearGreed && (
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Gauge className="w-3 h-3 text-neutral-500" />
                                        <span className="text-[10px] text-neutral-500">恐懼貪婪</span>
                                    </div>
                                    <div className={`text-xl font-bold font-mono ${getFearGreedColor(parseInt(fearGreed.value))}`}>
                                        {fearGreed.value}
                                    </div>
                                    <div className="text-[10px] text-neutral-500">{fearGreed.classification}</div>
                                </div>
                            )}
                            {/* Total Market Cap */}
                            {globalData && (
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <DollarSign className="w-3 h-3 text-neutral-500" />
                                        <span className="text-[10px] text-neutral-500">總市值</span>
                                    </div>
                                    <div className="text-lg font-bold font-mono text-white">${globalData.totalMarketCap}</div>
                                    <div className="text-[10px] text-neutral-500">24h ${globalData.totalVolume}</div>
                                </div>
                            )}
                            {/* BTC Dominance */}
                            {globalData && (
                                <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Bitcoin className="w-3 h-3 text-orange-500" />
                                        <span className="text-[10px] text-neutral-500">BTC 市佔</span>
                                    </div>
                                    <div className="text-lg font-bold font-mono text-orange-400">{globalData.btcDominance}%</div>
                                    <div className="text-[10px] text-neutral-500">${globalData.btcMarketCap}</div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Today's Focus - Featured Article */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">🔥 今日焦點</h2>
                        <Link href="/articles" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-0.5">
                            更多 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <Skeleton className="h-24 bg-neutral-900/50 rounded-xl" />
                    ) : articles[0] && (
                        <Link href={`/content/${articles[0].id}`}>
                            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4 hover:bg-white/5 transition-all">
                                <div className="flex gap-3">
                                    {articles[0].thumbnail_url && (
                                        <img src={articles[0].thumbnail_url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">{articles[0].title}</h3>
                                        <p className="text-[11px] text-neutral-500 line-clamp-2">{articles[0].description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                </section>

                {/* Gainers & Losers */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">📈 漲跌榜</h2>
                        <Link href="/prediction" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-0.5">
                            查看詳情 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Gainers */}
                        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-xs font-medium text-green-400">漲幅</span>
                            </div>
                            <div className="space-y-1.5">
                                {loading ? (
                                    <Skeleton className="h-12 bg-neutral-800/50" />
                                ) : (marketData?.gainers || []).slice(0, 3).map((coin: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">{coin.symbol?.toUpperCase()}</span>
                                        <span className="font-mono text-green-400">+{Math.abs(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Losers */}
                        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                <TrendingUp className="w-3.5 h-3.5 text-red-400 rotate-180" />
                                <span className="text-xs font-medium text-red-400">跌幅</span>
                            </div>
                            <div className="space-y-1.5">
                                {loading ? (
                                    <Skeleton className="h-12 bg-neutral-800/50" />
                                ) : (marketData?.losers || []).slice(0, 3).map((coin: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">{coin.symbol?.toUpperCase()}</span>
                                        <span className="font-mono text-red-400">{(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Whale Watch */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">🐋 巨鯨動向</h2>
                        <Link href="/prediction" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-0.5">
                            查看詳情 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <Link href="/prediction">
                        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4 hover:bg-white/5 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Hyperliquid 頂尖交易者</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[10px] text-neutral-500">即時追蹤中</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                            </div>
                        </div>
                    </Link>
                </section>

                {/* Prediction Markets */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">🎯 預測市場</h2>
                        <Link href="/prediction" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-0.5">
                            查看全部 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <Skeleton className="h-20 bg-neutral-900/50 rounded-xl" />
                    ) : (
                        <div className="space-y-2">
                            {predictions.slice(0, 2).map((market, i) => (
                                <Link href={`https://polymarket.com/event/${market.slug}`} target="_blank" key={i}>
                                    <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-300 line-clamp-1 flex-1 mr-2">{market.question}</span>
                                            <span className="text-xs font-mono font-bold text-white shrink-0">
                                                {market.outcomes?.[0]?.probability
                                                    ? `${(market.outcomes[0].probability * 100).toFixed(0)}%`
                                                    : '--'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Coinglass Data Summaries */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">📊 核心數據</h2>
                        <Link href="/prediction" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-0.5">
                            更多 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <LiquidationSummary />
                        <FundingSummary />
                        <LongShortSummary />
                        {/* Calendar Summary - Moved here to align grid */}
                        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-bold text-white">財經日曆</span>
                                </div>
                                <span className="text-[9px] text-neutral-500">Upcoming</span>
                            </div>
                            <div className="space-y-2">
                                {(calendar || []).slice(0, 2).map((event: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-xs text-neutral-300 line-clamp-1">{event.event}</span>
                                        <div className="flex gap-0.5 shrink-0 ml-2">
                                            {[...Array(3)].map((_, starIdx) => (
                                                <div
                                                    key={starIdx}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        starIdx < event.importance ? (event.importance === 3 ? "bg-red-500" : "bg-yellow-500") : "bg-neutral-800"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {(!calendar || calendar.length === 0) && (
                                    <span className="text-[10px] text-neutral-500">今日無重大事件</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* More Articles */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">📝 更多文章</h2>
                        <Link href="/articles" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-0.5">
                            全部文章 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <Skeleton className="h-16 bg-neutral-900/50 rounded-xl" />
                    ) : (
                        <div className="bg-neutral-900/50 rounded-xl border border-white/5 divide-y divide-white/5">
                            {articles.slice(1, 4).map((article, i) => (
                                <Link href={`/content/${article.id}`} key={i}>
                                    <div className="p-3 hover:bg-white/5 transition-all flex items-center justify-between">
                                        <span className="text-xs text-neutral-300 line-clamp-1">{article.title}</span>
                                        <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

            </div>

            <BottomNav />
        </main>
    )
}
