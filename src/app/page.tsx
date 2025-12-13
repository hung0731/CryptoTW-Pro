'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { useLiff } from '@/components/LiffProvider'
import {
    Crown, Settings, Wallet, Bell, Gift,
    TrendingUp, FileText, BarChart3, Calendar,
    ChevronRight, Sparkles, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Quick Action Button Component
function QuickAction({ icon: Icon, label, href, color }: {
    icon: any, label: string, href: string, color?: string
}) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1.5">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                color || "bg-white/10"
            )}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-neutral-400">{label}</span>
        </Link>
    )
}

// Dashboard Card Component
function DashboardCard({
    title, icon: Icon, children, href, badge
}: {
    title: string, icon: any, children: React.ReactNode, href?: string, badge?: string
}) {
    const content = (
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#211FFF]" />
                    <span className="text-sm font-medium text-white">{title}</span>
                    {badge && (
                        <span className="text-[9px] bg-[#211FFF]/20 text-[#211FFF] px-1.5 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {href && <ChevronRight className="w-4 h-4 text-neutral-600" />}
            </div>
            {children}
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }
    return content
}

export default function ProDashboard() {
    const { profile } = useLiff()
    const [loading, setLoading] = useState(true)
    const [predictions, setPredictions] = useState<any[]>([])
    const [articles, setArticles] = useState<any[]>([])
    const [marketData, setMarketData] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch predictions
                const predRes = await fetch('/api/prediction/markets')
                const predData = await predRes.json()
                setPredictions(predData.markets?.slice(0, 3) || [])

                // Fetch articles
                const artRes = await fetch('/api/content?limit=3')
                const artData = await artRes.json()
                setArticles(artData.articles || [])

                // Fetch market data
                const mktRes = await fetch('/api/market')
                const mktData = await mktRes.json()
                setMarketData(mktData)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <PageHeader showLogo />

            {/* User Welcome Section */}
            <div className="px-4 pt-4 pb-6">
                <div className="flex items-center gap-3 mb-6">
                    {profile?.pictureUrl ? (
                        <img
                            src={profile.pictureUrl}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full border-2 border-[#211FFF]"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-[#211FFF]/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-[#211FFF]" />
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-neutral-400">歡迎回來</p>
                        <h1 className="text-lg font-bold text-white">
                            {profile?.displayName || 'Pro 會員'}
                        </h1>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-5 gap-4">
                    <QuickAction icon={Crown} label="大客戶" href="/vip" color="bg-[#211FFF]" />
                    <QuickAction icon={Wallet} label="交易所" href="/events" />
                    <QuickAction icon={Bell} label="通知" href="/profile" />
                    <QuickAction icon={Gift} label="空投" href="/events" />
                    <QuickAction icon={Settings} label="設定" href="/profile" />
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="px-4 space-y-4">

                {/* Market Overview Card */}
                <DashboardCard title="市場概況" icon={BarChart3} href="/prediction">
                    {loading ? (
                        <Skeleton className="h-16 bg-neutral-900/50" />
                    ) : marketData ? (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/30 rounded-xl p-2 text-center">
                                <p className="text-[10px] text-neutral-500">恐懼指數</p>
                                <p className="text-sm font-bold text-white">{marketData.fearGreed?.value || '--'}</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-2 text-center">
                                <p className="text-[10px] text-neutral-500">BTC 主導</p>
                                <p className="text-sm font-bold text-white">{marketData.globalData?.btcDominance || '--'}%</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-2 text-center">
                                <p className="text-[10px] text-neutral-500">24H 交易量</p>
                                <p className="text-sm font-bold text-white">${marketData.globalData?.totalVolume || '--'}</p>
                            </div>
                        </div>
                    ) : null}
                </DashboardCard>

                {/* Prediction Markets Card */}
                <DashboardCard title="預測市場" icon={TrendingUp} href="/prediction" badge="HOT">
                    {loading ? (
                        <Skeleton className="h-20 bg-neutral-900/50" />
                    ) : (
                        <div className="space-y-2">
                            {predictions.map((market, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-xs text-neutral-400 truncate flex-1 mr-2">
                                        {market.question}
                                    </span>
                                    <span className="text-xs font-mono text-[#211FFF]">
                                        {market.outcomes?.[0]?.probability
                                            ? `${(market.outcomes[0].probability * 100).toFixed(0)}%`
                                            : '--'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>

                {/* Featured Articles Card */}
                <DashboardCard title="精選文章" icon={FileText} href="/articles">
                    {loading ? (
                        <Skeleton className="h-20 bg-neutral-900/50" />
                    ) : (
                        <div className="space-y-2">
                            {articles.map((article, i) => (
                                <div key={i} className="flex items-center gap-2 py-1">
                                    <span className="text-[10px] text-neutral-600">{i + 1}</span>
                                    <span className="text-xs text-white truncate">
                                        {article.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>

                {/* Whale Watch Card */}
                <DashboardCard title="巨鯨動向" icon={Users} href="/prediction">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-neutral-400">即時追蹤中</span>
                        </div>
                        <span className="text-xs text-[#211FFF]">查看詳情 →</span>
                    </div>
                </DashboardCard>

                {/* Economic Calendar Card */}
                <DashboardCard title="財經日曆" icon={Calendar} badge="即將推出">
                    <div className="py-2 text-center">
                        <span className="text-xs text-neutral-500">敬請期待 Coinglass 整合</span>
                    </div>
                </DashboardCard>

            </div>

            <BottomNav />
        </div>
    )
}
