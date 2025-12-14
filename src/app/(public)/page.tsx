'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { useLiff } from '@/components/LiffProvider'
import {
    TrendingUp, BarChart3, Calendar, Users,
    ChevronRight, Bell, Settings, Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIMarketPulse } from '@/components/AIMarketPulse'
import { TopCoinCards } from '@/components/TopCoinCards'
import { PromoBanner } from '@/components/PromoBanner'
import { QuickActions } from '@/components/QuickActions'
import { MarketFeelingCard } from '@/components/MarketSignalCards'
import { LiquidationSummary, FundingSummary, LongShortSummary, IndicatorsGrid } from '@/components/CoinglassWidgets'
import { UsdtRateCard } from '@/components/UsdtRateCard'
import type { MarketSignals } from '@/lib/signal-engine'

export default function HomePage() {
    const { profile, isLoading: isAuthLoading } = useLiff()
    const [loading, setLoading] = useState(true)

    const [marketData, setMarketData] = useState<any>(null)
    const [fearGreed, setFearGreed] = useState<any>(null)
    const [globalData, setGlobalData] = useState<any>(null)
    const [predictions, setPredictions] = useState<any[]>([])
    const [calendar, setCalendar] = useState<any[]>([])
    const [signals, setSignals] = useState<MarketSignals | null>(null)
    const [marketReport, setMarketReport] = useState<any>(null)
    const [signalsLoading, setSignalsLoading] = useState(true)
    const [greeting, setGreeting] = useState("")

    useEffect(() => {
        // Dynamic Greeting Logic
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
        setGreeting(getGreeting())

        const fetchData = async () => {
            try {
                const [mktRes, predRes, calRes, reportRes] = await Promise.all([
                    fetch('/api/market'),
                    fetch('/api/prediction/markets?limit=3'),
                    fetch('/api/coinglass/calendar'),
                    fetch('/api/market-summary')
                ])

                const mktData = await mktRes.json()
                const predData = await predRes.json()
                const calData = await calRes.json()
                const reportData = await reportRes.json()

                if (mktData.market) setMarketData(mktData.market)
                if (mktData.fearGreed) setFearGreed(mktData.fearGreed)
                if (mktData.global) setGlobalData(mktData.global)
                setPredictions(predData.markets || [])
                setCalendar(calData.calendar?.events || [])

                // Set Signals and Report
                if (reportData.signals) setSignals(reportData.signals)
                if (reportData.report) setMarketReport(reportData.report)

            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
                setSignalsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Helper for Market Anchor
    const getMarketAnchor = (signals: MarketSignals | null) => {
        if (!signals) return { text: "📌 市場狀態：數據分析中...", color: "text-neutral-500" }

        const feeling = signals.market_feeling || "中性"
        let status = ""
        let advice = ""

        if (feeling.includes("多") || feeling.includes("貪婪")) {
            status = "偏多主導"
            advice = "適合等待回調"
            if (feeling.includes("謹慎")) advice = "留意高位風險"
        } else if (feeling.includes("空") || feeling.includes("恐慌")) {
            status = "偏空調整"
            advice = "反彈尋找賣點"
        } else {
            status = "震盪整理"
            advice = "多空拉鋸中"
        }

        // Use greeting if available, else fallback to 📌
        const prefix = greeting ? `${greeting}，` : "📌 "

        return {
            text: `${prefix}今日市場：${status}｜${advice}`,
            color: feeling.includes("多") ? "text-green-400" : feeling.includes("空") ? "text-red-400" : "text-blue-300"
        }
    }

    if (isAuthLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <img src="/logo.svg" className="h-8 w-auto opacity-50 animate-pulse" />
        </div>
    }

    const anchor = getMarketAnchor(signals)

    return (
        <main className="min-h-screen font-sans bg-black text-white pb-24">
            <PageHeader showLogo />

            <div className="mt-4 px-4 space-y-5">

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

                {/* Anchor Pin - One Line Judgment */}
                {!loading && (
                    <div className="bg-neutral-900/80 border border-white/10 rounded-lg p-3 flex items-center justify-center shadow-lg backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className={cn("text-sm font-bold relative z-10 text-center tracking-wide", anchor.color)}>
                            {anchor.text}
                        </span>
                    </div>
                )}

                {/* Quick Actions */}
                <QuickActions />

                {/* ===== 1. Top Coins - 市場溫度計 ===== */}
                <section>
                    <TopCoinCards />
                </section>

                {/* ===== USDT/TWD 匯率 ===== */}
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-medium text-neutral-500">台幣匯率</h2>
                    </div>
                    <UsdtRateCard />
                </section>

                {/* ===== 2. AI Market Intelligence ===== */}
                {marketReport && (
                    <AIMarketPulse report={marketReport} />
                )}

                {/* ===== 3. Market Sentiment (Human) ===== */}
                <section>
                    <h2 className="text-sm font-medium text-neutral-500 mb-3">市場體感</h2>
                    <MarketFeelingCard signals={signals} loading={signalsLoading} />
                </section>

                {/* ===== 4. On-Chain Indicators (Data) ===== */}
                <section>
                    <h2 className="text-sm font-medium text-neutral-500 mb-3">鏈上指標</h2>
                    <IndicatorsGrid compact />
                </section>

                {/* ===== 4. Core Data - 專業數據 ===== */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">核心數據</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <LiquidationSummary />
                        <FundingSummary />
                        <LongShortSummary />
                        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 h-full">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-bold text-white">財經日曆</span>
                                </div>
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

                {/* ===== 5. Gainers & Losers ===== */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">漲跌榜</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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

                {/* ===== 6. OKX Promo Banner ===== */}
                <PromoBanner affiliateLink="https://www.okx.com/join/CRYPTOTW" />

                {/* ===== 7. Whale Watch ===== */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">巨鯨動向</h2>
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

                {/* ===== 8. Prediction Markets ===== */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">預測市場</h2>
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



            </div>

            <BottomNav />
        </main>
    )
}
