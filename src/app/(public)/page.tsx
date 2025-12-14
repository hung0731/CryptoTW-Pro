'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { useLiff } from '@/components/LiffProvider'
import {
    Bell, Settings, ChevronRight, Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { MarketStatusGrid } from '@/components/home/MarketStatusGrid'
import { MarketEntryWidgets } from '@/components/home/MarketEntryWidgets'

export default function HomePage() {
    const { profile, isLoading: isAuthLoading } = useLiff()

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
                            <p className="text-xs text-neutral-500">{greeting}</p>
                            <h1 className="text-base font-bold text-white">
                                {profile?.displayName || 'Pro 會員'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/profile" className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors">
                            <Bell className="w-4 h-4 text-neutral-400" />
                        </Link>
                        <Link href="/profile" className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors">
                            <Settings className="w-4 h-4 text-neutral-400" />
                        </Link>
                    </div>
                </div>

                {/* ===== 1. Flash News Feed (Protagonist) ===== */}
                <FlashNewsFeed compact />

                {/* ===== 2. Market Status (Dashboard) ===== */}
                <MarketStatusGrid />

                {/* ===== 3. Market Tools (Entry) ===== */}
                <MarketEntryWidgets />

            </div>

            <BottomNav />
        </main>
    )
}
