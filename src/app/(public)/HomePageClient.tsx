'use client'

import React from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { useLiff } from '@/components/LiffProvider'
import { cn } from '@/lib/utils'
import {
    ChevronRight, Sparkles, CandlestickChart, Activity, DollarSign, Wallet, Calendar, Bell, Settings, LineChart, ArrowUpRight
} from 'lucide-react'
import { MobileOptimizedLayout } from '@/components/layout/PageLayout'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { WelcomeModal, useWelcomeModal } from '@/components/WelcomeModal'
import { UpcomingEventsCard } from '@/components/home/UpcomingEventsCard'
import { FeaturedReviewsCard } from '@/components/home/FeaturedReviewsCard'
import { MacroReaction } from '@/lib/macro-events'
import { SPACING } from '@/lib/design-tokens'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard } from '@/components/ui/UniversalCard'

import { ActionCard } from '@/components/home/ActionCard'
import { MarketStatusData, Conclusion, MarketContext } from '@/lib/types'
import { HistoricalEchoCard } from '@/components/home/HistoricalEchoCard'
import { findHistoricalSimilarity } from '@/lib/historical-matcher'

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

    if (isAuthLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <img src="/logo.svg" alt="CryptoTW Logo" className="h-8 w-auto opacity-50" />
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


                </section>

                {/* 3. Historical Echo */}
                <section>
                    <HistoricalEchoCard match={historicalMatch} />
                </section>

                {/* ===== BELOW THE FOLD: Detailed Context ===== */}
                <section className="flex flex-col gap-6">
                    {/* Explore More Grid */}
                    <UniversalCard variant="default" className="p-0 overflow-hidden">
                        <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                            <SectionHeaderCard title="探索更多" />
                        </div>
                        <div className="grid grid-cols-4 bg-[#1A1A1A] gap-px border-b border-[#1A1A1A]">
                            {[
                                { href: '/calendar', label: '財經日曆', icon: Calendar },
                                { href: '/price-prediction', label: '價格預測', icon: Wallet },
                                { href: '/reviews', label: '歷史復盤', icon: LineChart },
                                { href: '/news', label: '快訊中心', icon: DollarSign },
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

                    <UpcomingEventsCard reactions={reactions} />
                    <FlashNewsFeed compact initialContext={initialContext} />
                    <FeaturedReviewsCard />
                </section>



            </MobileOptimizedLayout>
        </main>
    )
}
