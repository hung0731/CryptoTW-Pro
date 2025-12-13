'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLiff } from '@/components/LiffProvider'
import {
    Crown, Settings, Wallet, Bell, Gift, LayoutDashboard,
    TrendingUp, FileText, BarChart3, Calendar, Users,
    ChevronRight, Sparkles, Gauge, DollarSign, Bitcoin
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Quick Action Component
function QuickAction({ icon: Icon, label, href, color }: {
    icon: any, label: string, href: string, color?: string
}) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1.5">
            <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center border border-white/5",
                color || "bg-neutral-900/50"
            )}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-neutral-400">{label}</span>
        </Link>
    )
}

export default function ProDashboard() {
    const { profile } = useLiff()
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [predictions, setPredictions] = useState<any[]>([])
    const [articles, setArticles] = useState<any[]>([])
    const [marketData, setMarketData] = useState<any>(null)
    const [fearGreed, setFearGreed] = useState<any>(null)
    const [globalData, setGlobalData] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [predRes, artRes, mktRes] = await Promise.all([
                    fetch('/api/prediction/markets?limit=5'),
                    fetch('/api/content?limit=5'),
                    fetch('/api/market')
                ])

                const predData = await predRes.json()
                const artData = await artRes.json()
                const mktData = await mktRes.json()

                setPredictions(predData.markets || [])
                setArticles(artData.content || [])
                if (mktData.market) setMarketData(mktData.market)
                if (mktData.fearGreed) setFearGreed(mktData.fearGreed)
                if (mktData.global) setGlobalData(mktData.global)
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

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader showLogo />

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                {/* Sticky Tabs */}
                <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-2 pb-0">
                    <TabsList className="grid w-full grid-cols-3 bg-neutral-900/50 p-0.5 rounded-lg h-9">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1.5">
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            儀表板
                        </TabsTrigger>
                        <TabsTrigger value="articles" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            精選文章
                        </TabsTrigger>
                        <TabsTrigger value="prediction" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 rounded-md text-[10px] font-medium transition-all py-1.5 flex items-center justify-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5" />
                            預測市場
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB 1: Overview Dashboard */}
                <TabsContent value="overview" className="space-y-4 p-4 min-h-[50vh]">

                    {/* Welcome + Quick Actions */}
                    <div className="flex items-center gap-3 mb-4">
                        {profile?.pictureUrl ? (
                            <img
                                src={profile.pictureUrl}
                                alt="Avatar"
                                className="w-11 h-11 rounded-full border-2 border-white/20"
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-neutral-500">歡迎回來</p>
                            <h1 className="text-base font-bold text-white">
                                {profile?.displayName || 'Pro 會員'}
                            </h1>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        <QuickAction icon={Crown} label="大客戶" href="/vip" color="bg-white/10" />
                        <QuickAction icon={Wallet} label="交易所" href="/events" />
                        <QuickAction icon={Bell} label="通知" href="/profile" />
                        <QuickAction icon={Gift} label="空投" href="/events" />
                        <QuickAction icon={Settings} label="設定" href="/profile" />
                    </div>

                    {/* Global Stats Grid */}
                    {!loading && (fearGreed || globalData) && (
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

                    {loading && (
                        <div className="grid grid-cols-3 gap-3">
                            <Skeleton className="h-24 bg-neutral-900/50" />
                            <Skeleton className="h-24 bg-neutral-900/50" />
                            <Skeleton className="h-24 bg-neutral-900/50" />
                        </div>
                    )}

                    {/* Market Gainers/Losers Preview */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {/* Gainers */}
                        <Link href="/prediction" className="bg-neutral-900/30 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-medium text-green-400">漲幅榜</span>
                            </div>
                            <div className="space-y-1.5">
                                {loading ? (
                                    <Skeleton className="h-16 bg-neutral-900/50" />
                                ) : (marketData?.gainers || []).slice(0, 3).map((coin: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">{coin.symbol?.toUpperCase()}</span>
                                        <span className="font-mono text-green-400">+{Math.abs(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </Link>

                        {/* Losers */}
                        <Link href="/prediction" className="bg-neutral-900/30 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                                <span className="text-xs font-medium text-red-400">跌幅榜</span>
                            </div>
                            <div className="space-y-1.5">
                                {loading ? (
                                    <Skeleton className="h-16 bg-neutral-900/50" />
                                ) : (marketData?.losers || []).slice(0, 3).map((coin: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">{coin.symbol?.toUpperCase()}</span>
                                        <span className="font-mono text-red-400">{(coin.price_change_percentage_24h || parseFloat(coin.priceChangePercent) || 0).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </Link>
                    </div>

                    {/* Whale Watch + Calendar Preview */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <Link href="/prediction" className="bg-neutral-900/30 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-medium text-white">巨鯨動向</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] text-neutral-500">即時追蹤中</span>
                            </div>
                        </Link>

                        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3 opacity-60">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-medium text-white">財經日曆</span>
                            </div>
                            <span className="text-[10px] text-neutral-500">即將推出</span>
                        </div>
                    </div>

                </TabsContent>

                {/* TAB 2: Articles */}
                <TabsContent value="articles" className="space-y-4 p-4 min-h-[50vh]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">精選文章</h2>
                        <Link href="/articles" className="text-xs text-neutral-400 hover:text-white">查看全部 →</Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 bg-neutral-900/50" />
                            <Skeleton className="h-20 bg-neutral-900/50" />
                            <Skeleton className="h-20 bg-neutral-900/50" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {articles.map((article, i) => (
                                <Link href={`/content/${article.id}`} key={i}>
                                    <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-all flex items-start gap-3">
                                        {article.thumbnail_url && (
                                            <img src={article.thumbnail_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-white line-clamp-2">{article.title}</h3>
                                            <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{article.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB 3: Predictions */}
                <TabsContent value="prediction" className="space-y-4 p-4 min-h-[50vh]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">預測市場</h2>
                        <Link href="/prediction" className="text-xs text-neutral-400 hover:text-white">查看全部 →</Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 bg-neutral-900/50" />
                            <Skeleton className="h-24 bg-neutral-900/50" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {predictions.slice(0, 5).map((market, i) => (
                                <Link href={`https://polymarket.com/event/${market.slug}`} target="_blank" key={i}>
                                    <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 p-1.5 shrink-0 border border-white/10">
                                                <img src={market.icon || '/logo.svg'} className="w-full h-full object-contain opacity-80" />
                                            </div>
                                            <h3 className="text-sm font-medium text-neutral-200 line-clamp-2">{market.question}</h3>
                                        </div>
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
