'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { useLiff } from '@/components/LiffProvider'
import { cn } from '@/lib/utils'
import {
    ChevronRight, Sparkles, CandlestickChart, Activity, DollarSign, Wallet, Calendar, Bell, Settings, LineChart, ArrowUpRight, School, LayoutDashboard, FileText, Gift
} from 'lucide-react'
import { MobileOptimizedLayout } from '@/components/layout/PageLayout'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { WelcomeModal, useWelcomeModal } from '@/components/WelcomeModal'
import { EventsUpcomingCard } from '@/components/home/EventsUpcomingCard'
import { ReviewsFeaturedCard } from '@/components/home/ReviewsFeaturedCard'
import { MacroReaction } from '@/lib/macro-events'
import { SPACING } from '@/lib/design-tokens'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { CommandCenterCard } from '@/components/ui/CommandCenterCard'

import { QuickActionCard } from '@/components/home/QuickActionCard'
import { MarketStatusData, Conclusion, MarketContext } from '@/lib/types'
import { HistoryEchoCard } from '@/components/home/HistoryEchoCard'
import { findHistoricalSimilarity, HistoricalMatch } from '@/lib/historical-matcher'
import { LineConnectCard } from '@/components/home/LineConnectCard'
import { SentimentDashboardCard } from '@/components/home/SentimentDashboardCard'
import { CurrencyConverter } from '@/components/home/CurrencyConverter'
import { Skeleton } from '@/components/ui/skeleton'

export function HomePageClient() {
    const { profile, dbUser, isLoading: isAuthLoading, liffObject, error, retry } = useLiff()

    // Client-side data states
    const [reactions, setReactions] = useState<Record<string, MacroReaction>>({})
    const [marketStatus, setMarketStatus] = useState<MarketStatusData | null>(null)
    const [marketConclusion, setMarketConclusion] = useState<Conclusion | null>(null)
    const [marketContext, setMarketContext] = useState<MarketContext | null>(null)
    const [historicalMatch, setHistoricalMatch] = useState<HistoricalMatch | null>(null)
    const [dataLoading, setDataLoading] = useState(true)

    // Fetch data on client-side (non-blocking)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for speed
                const [statusRes, contextRes] = await Promise.all([
                    fetch('/api/market/status').then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch('/api/market-context').then(r => r.ok ? r.json() : null).catch(() => null)
                ])

                if (statusRes?.status) {
                    setMarketStatus(statusRes.status)
                    setMarketConclusion(statusRes.conclusion)
                    // Calculate historical match
                    const match = findHistoricalSimilarity(statusRes.status)
                    setHistoricalMatch(match)
                }

                if (contextRes?.context) {
                    setMarketContext(contextRes.context)
                }
            } catch (e) {
                console.error('Failed to fetch homepage data:', e)
            } finally {
                setDataLoading(false)
            }
        }

        // Load reactions from static JSON (fast)
        fetch('/data/macro-reactions.json')
            .then(r => r.ok ? r.json() : { data: {} })
            .then(data => setReactions(data.data || {}))
            .catch(() => setReactions({}))

        void fetchData()
    }, [])

    // Check if user is Pro
    const isPro = dbUser?.membership_status === 'pro' || dbUser?.membership_status === 'lifetime'
    const isPending = dbUser?.membership_status === 'pending'

    // Welcome modal
    const { showWelcome, closeWelcome } = useWelcomeModal(isPro)

    // Greeting Logic
    const [greeting] = React.useState(() => {
        const hour = new Date().getHours()
        const greetings = {
            morning: ["👋 早安", "🌅 早上好", "☀️ 早安", "💪 早安，戰神", "🥐 吃早餐了嗎"],
            noon: ["🍱 午安", "🍚 吃飽了嗎", "☀️ 中午好", "🍱 該吃飯囉"],
            afternoon: ["☕️ 下午好", "🍰 喝杯咖啡", "🌇 堅持一下", "🍵 休息時間"],
            evening: ["🌙 晚上好", "🥘 晚餐愉快", "🧘‍♂️ 辛苦了", "🛁 放鬆一下"],
            night: ["💤 晚安", "🦉 夜深了", "🛌 早點休息", "🌌 該睡囉"]
        }
        let list = greetings.night
        if (hour >= 5 && hour < 11) list = greetings.morning
        else if (hour >= 11 && hour < 14) list = greetings.noon
        else if (hour >= 14 && hour < 18) list = greetings.afternoon
        else if (hour >= 18 && hour < 23) list = greetings.evening
        return list[Math.floor(Math.random() * list.length)]
    })

    // Error State with Retry
    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">連線發生問題</h2>
                <p className="text-sm text-neutral-500 mb-6 max-w-[280px]">
                    {error.message || '無法連接 LINE 服務，請稍後再試。'}
                </p>
                <button
                    onClick={retry}
                    className="px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:bg-neutral-200 transition-colors"
                >
                    重新嘗試
                </button>
            </div>
        )
    }

    // Skeleton Loading State (only if no cached user)
    if (isAuthLoading && !dbUser) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse" />
                    <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen font-sans bg-black text-white">
            <PageHeader showLogo />

            <WelcomeModal isOpen={showWelcome} onClose={closeWelcome} />

            <MobileOptimizedLayout className={SPACING.classes.mtHeader}>

                {/* ===== FIRST SCREEN: Greetings & Key Status ===== */}
                <section className={SPACING.classes.gapCards}>
                    {/* Welcome Component */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {!dbUser && !profile ? (
                                <div
                                    onClick={() => liffObject?.login()}
                                    className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
                                >
                                    <span className="text-sm">登入</span>
                                </div>
                            ) : (dbUser?.picture_url || profile?.pictureUrl) ? (
                                <img
                                    src={dbUser?.picture_url || profile?.pictureUrl}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border border-white/20"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                    <span className="text-lg">👋</span>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-neutral-500">{greeting}</p>
                                <h1 className="text-base font-bold text-white">
                                    {(dbUser?.display_name || profile?.displayName) || (
                                        <span
                                            onClick={() => liffObject?.login()}
                                            className="cursor-pointer hover:text-white/80"
                                        >
                                            立即登入
                                        </span>
                                    )}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/profile" className="w-9 h-9 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center hover:bg-[#0E0E0F]">
                                <Bell className="w-4 h-4 text-[#808080]" />
                            </Link>
                            <Link href="/profile" className="w-9 h-9 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center hover:bg-[#0E0E0F]">
                                <Settings className="w-4 h-4 text-[#808080]" />
                            </Link>
                        </div>
                    </div>

                    {/* NEW: Global Command Center */}
                    <div className="mb-6">
                        <CommandCenterCard />
                    </div>

                    {/* Pro CTA (Non-Pro) */}
                    {!isPro && (
                        <Link href="/join" className="block mb-4">
                            <UniversalCard
                                variant="highlight"
                                size="M"
                                className={cn("flex items-center justify-between", isPending && "border-yellow-500/30")}
                            >
                                <div className="flex items-center gap-2">
                                    {isPending ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    )}
                                    <span className={cn("text-sm font-bold", isPending ? "text-yellow-500" : "text-white")}>
                                        {isPending ? 'Pro 會員資格審核中' : '解鎖完整 Pro 功能'}
                                    </span>
                                </div>
                                <ChevronRight className={cn("w-4 h-4", isPending ? "text-yellow-500" : "text-white/40")} />
                            </UniversalCard>
                        </Link>
                    )}


                </section>

                {/* 3. Historical Echo */}
                <section>
                    {dataLoading ? (
                        <div className="space-y-3 mt-8 mb-8">
                            <Skeleton className="h-6 w-24 bg-neutral-800" />
                            <Skeleton className="h-24 w-full bg-neutral-800 rounded-xl" />
                        </div>
                    ) : (
                        <HistoryEchoCard match={historicalMatch} />
                    )}
                </section>

                {/* 4. Market Sentiment Dashboard */}
                <section>
                    {dataLoading ? (
                        <Skeleton className="h-32 w-full bg-neutral-800 rounded-xl" />
                    ) : (
                        <SentimentDashboardCard status={marketStatus} />
                    )}
                </section>

                {/* ===== BELOW THE FOLD: Detailed Context ===== */}
                <section className="flex flex-col gap-6 mt-6">
                    {/* Explore More Grid */}
                    <UniversalCard variant="luma" className="p-0 overflow-hidden">
                        <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                            <SectionHeaderCard
                                title="免費功能"
                                icon={LayoutDashboard}
                            />
                        </div>
                        <div className="grid grid-cols-5 bg-[#1A1A1A] gap-px border-b border-[#1A1A1A]">
                            {[
                                { href: '/converter', label: '匯率', icon: DollarSign },
                                { href: '/events', label: '活動', icon: Sparkles },
                                { href: '/rewards', label: '福利中心', icon: Gift },
                                { href: '/articles', label: '深度文章', icon: FileText },
                                { href: '/learn', label: '學習', icon: School },
                            ].map((item) => (
                                <Link key={item.href} href={item.href} className="group bg-[#0A0A0A] hover:bg-[#141414] transition-colors p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                                    <div className="w-10 h-10 rounded-2xl bg-[#151515] flex items-center justify-center border border-[#2A2A2A] text-[#666] group-hover:text-white group-hover:border-[#444] transition-all">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-[#888] group-hover:text-white transition-colors">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </UniversalCard>

                    <EventsUpcomingCard reactions={reactions} />
                    <FlashNewsFeed compact initialContext={marketContext} />
                    <ReviewsFeaturedCard />
                </section>

                {/* SiteFooter is rendered in layout.tsx */}

            </MobileOptimizedLayout>

            {/* Conditional Global Popup */}
            <LineConnectCard />
        </main>
    )
}
