'use client'

import React from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { useLiff } from '@/components/LiffProvider'
import { cn } from '@/lib/utils'
import {
    Bell, Settings, ChevronRight, Sparkles, CandlestickChart, Activity, DollarSign, Wallet
} from 'lucide-react'
import { MobileOptimizedLayout } from '@/components/layout/PageLayout'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { WelcomeModal, useWelcomeModal } from '@/components/WelcomeModal'
import { UpcomingEventsCard } from '@/components/home/UpcomingEventsCard'
import { FeaturedReviewsCard } from '@/components/home/FeaturedReviewsCard'
import { MarketConditions } from '@/components/home/MarketConditions'
import { MacroReaction } from '@/lib/macro-events'
import { SPACING } from '@/lib/design-tokens'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard } from '@/components/ui/UniversalCard'

import { ActionCard } from '@/components/home/ActionCard'
import { MarketStatusData, Conclusion, MarketContext } from '@/lib/types'
import { HistoricalEchoCard } from '@/components/home/HistoricalEchoCard'
import { findHistoricalSimilarity } from '@/lib/historical-matcher'
import { MarketOverviewGrid } from '@/components/home/MarketOverviewGrid'

interface HomePageClientProps {
    reactions: Record<string, MacroReaction>
    initialStatus: MarketStatusData | null
    initialConclusion: Conclusion | null
    initialContext: MarketContext | null
}

export function HomePageClient({
    reactions,
    initialStatus,
    initialConclusion,
    initialContext
}: HomePageClientProps) {
    const { profile, dbUser, isLoading: isAuthLoading, liffObject } = useLiff()

    // Check if user is Pro
    const isPro = dbUser?.membership_status === 'pro' || dbUser?.membership_status === 'lifetime'
    const isPending = dbUser?.membership_status === 'pending'

    // Welcome modal
    const { showWelcome, closeWelcome } = useWelcomeModal(isPro)

    // Historical Match
    // Cast strict type if needed, assuming compat for now
    const historicalMatch = initialStatus ? findHistoricalSimilarity(initialStatus as any) : null

    // Greeting Logic
    const getGreeting = () => {
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
    }
    const greeting = getGreeting()

    if (isAuthLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <img src="/logo.svg" className="h-8 w-auto opacity-50" />
        </div>
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
                            {!profile ? (
                                <div
                                    onClick={() => liffObject?.login()}
                                    className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
                                >
                                    <span className="text-sm">登入</span>
                                </div>
                            ) : profile?.pictureUrl ? (
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
                                <p className="text-xs text-neutral-500">{greeting}</p>
                                <h1 className="text-base font-bold text-white">
                                    {profile?.displayName || (
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

                    {/* Pro CTA (Non-Pro) */}
                    {!isPro && (
                        <Link href="/join" className="block mb-4">
                            <UniversalCard
                                variant="highlight"
                                size="S"
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

                    {/* 1. Market Snapshot (Decision Card) */}
                    <MarketOverviewGrid status={initialStatus} conclusion={initialConclusion} />

                    {/* 2. Secondary Context (Conditions) */}
                    <div className="mt-3">
                        <MarketConditions status={initialStatus} />
                    </div>
                </section>

                {/* 3. Historical Echo */}
                <section>
                    <HistoricalEchoCard match={historicalMatch} />
                </section>

                {/* ===== BELOW THE FOLD: Detailed Context ===== */}
                <section className={SPACING.classes.gapCards}>
                    <SectionHeaderCard
                        title="接下來會發生什麼"
                        description="市場關注焦點與即將發生的事件"
                    />
                    <UpcomingEventsCard reactions={reactions} />
                    <FlashNewsFeed compact initialContext={initialContext} />
                    <FeaturedReviewsCard />
                </section>

                {/* ===== Discovery Section ===== */}
                <section className={SPACING.classes.gapCards}>
                    <SectionHeaderCard title="探索更多" />

                    <div className={cn("grid grid-cols-2", SPACING.classes.gapCards)}>
                        <ActionCard
                            title="財經日曆"
                            href="/calendar"
                            icon={CandlestickChart}
                        />
                        <ActionCard
                            title="價格預測"
                            href="/prediction"
                            icon={Wallet}
                        />
                        <ActionCard
                            title="歷史復盤"
                            href="/reviews"
                            icon={Activity}
                        />
                        <ActionCard
                            title="快訊中心"
                            href="/news"
                            icon={DollarSign}
                        />
                    </div>
                </section>

            </MobileOptimizedLayout>
        </main>
    )
}
