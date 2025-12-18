'use client'

import React from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { useLiff } from '@/components/LiffProvider'
import { cn } from '@/lib/utils'
import {
    Bell, Settings, ChevronRight, Sparkles
} from 'lucide-react'
import { MobileOptimizedLayout } from '@/components/layout/PageLayout'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { WelcomeModal, useWelcomeModal } from '@/components/WelcomeModal'
import { UpcomingEventsCard } from '@/components/home/UpcomingEventsCard'
import { FeaturedReviewsCard } from '@/components/home/FeaturedReviewsCard'
import { SentimentMatrix } from '@/components/home/SentimentMatrix'
import { MacroReaction } from '@/lib/macro-events'
import { CARDS, TYPOGRAPHY } from '@/lib/design-tokens'

import { ActionCard } from '@/components/home/ActionCard'
import { CandlestickChart, Activity, DollarSign, Wallet } from 'lucide-react'
import { MarketStatusData, Conclusion, MarketContext } from '@/lib/types'

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
    const { profile, dbUser, isLoading: isAuthLoading } = useLiff()

    // Check if user is Pro
    const isPro = dbUser?.membership_status === 'pro' || dbUser?.membership_status === 'lifetime'

    // Welcome modal for new Pro users
    const { showWelcome, closeWelcome } = useWelcomeModal(isPro)

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

            {/* Welcome Modal for new Pro users */}
            <WelcomeModal isOpen={showWelcome} onClose={closeWelcome} />

            <MobileOptimizedLayout className="mt-4 space-y-6">

                {/* Welcome Component */}
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
                            <p className="text-xs text-neutral-500">{greeting}</p>
                            <h1 className="text-base font-bold text-white">
                                {profile?.displayName || 'Pro 會員'}
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

                {/* Unlock CTA (Non-Pro Users) */}
                {!isPro && (
                    <Link href="/join" className="block">
                        <div className={cn("flex items-center justify-between", CARDS.secondary)}>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-sm font-medium text-white">解鎖完整 Pro 功能</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-neutral-400">
                                <span>免費</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </Link>
                )}



                {/* ===== Sentiment Dashboard ===== */}
                <section className="mt-6">
                    <SentimentMatrix />
                </section>

                {/* ===== Context Section ===== */}
                <section className="space-y-3">
                    <h2 className={cn(TYPOGRAPHY.sectionTitle, "pl-1")}>📅 接下來會發生什麼</h2>
                    <UpcomingEventsCard reactions={reactions} />
                    <FlashNewsFeed compact initialContext={initialContext} />
                    <FeaturedReviewsCard />
                </section>

                {/* ===== Discovery Section ===== */}
                <section className="space-y-3">
                    <h2 className={cn(TYPOGRAPHY.sectionTitle, "pl-1")}>🔍 挖更深</h2>

                    {/* Instrument Tiles (No meta descriptions) */}
                    <div className="grid grid-cols-2 gap-3">
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
