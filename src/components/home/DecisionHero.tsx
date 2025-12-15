'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Scale, ChevronRight, AlertTriangle, History } from 'lucide-react'

interface Conclusion {
    bias: '偏多' | '偏空' | '觀望'
    action: string
    emoji: string
    reasoning: string
}

interface StatusItem {
    label: string
    code: string
    value: string
}

interface MarketStatus {
    regime: StatusItem
    leverage: StatusItem
    sentiment: StatusItem
    whale: StatusItem
    volatility: StatusItem
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

// Calculate risk level from status data
function calculateRiskLevel(status: MarketStatus): RiskLevel {
    const bullishSignals = [
        status.sentiment.code === 'fear',
        status.whale.code === 'bullish',
        status.leverage.code === 'cool',
    ].filter(Boolean).length

    const bearishSignals = [
        status.sentiment.code === 'greed',
        status.whale.code === 'bearish',
        status.leverage.code === 'overheated',
    ].filter(Boolean).length

    const cautionSignals = [
        status.regime.code === 'pressure',
        status.volatility.code === 'high',
    ].filter(Boolean).length

    if (cautionSignals >= 1) return 'HIGH'
    if (bearishSignals >= 2) return 'HIGH'
    if (bullishSignals >= 2 && cautionSignals === 0) return 'LOW'
    return 'MEDIUM'
}

// Risk level visuals
const riskConfig = {
    LOW: {
        label: '低風險',
        sublabel: '適合策略執行',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        icon: TrendingUp,
        glow: 'shadow-green-500/20',
    },
    MEDIUM: {
        label: '中風險',
        sublabel: '小倉位 / 等確認',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: Scale,
        glow: 'shadow-amber-500/20',
    },
    HIGH: {
        label: '高風險',
        sublabel: '觀望 / 降槓桿',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: AlertTriangle,
        glow: 'shadow-red-500/20',
    },
}

export function DecisionHero() {
    const [conclusion, setConclusion] = useState<Conclusion | null>(null)
    const [status, setStatus] = useState<MarketStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/status')
                if (!res.ok) throw new Error('API Error')
                const json = await res.json()
                if (json.conclusion) setConclusion(json.conclusion)
                if (json.status) setStatus(json.status)
            } catch (e) {
                console.error('DecisionHero fetch error:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-28 w-full bg-neutral-900/50 rounded-2xl" />
            </div>
        )
    }

    if (!conclusion || !status) {
        return null // Don't render if no data
    }

    const riskLevel = calculateRiskLevel(status)
    const config = riskConfig[riskLevel]
    const RiskIcon = config.icon

    return (
        <div className="space-y-3">
            {/* Hero Decision Card */}
            <div className={cn(
                "relative rounded-2xl border p-4 transition-all",
                config.bg,
                config.border,
                "shadow-lg",
                config.glow
            )}>
                {/* Risk Badge - Top Right */}
                <div className="absolute -top-2 -right-2 z-10">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shadow-lg",
                        config.bg,
                        config.border,
                        config.color,
                        "backdrop-blur-md"
                    )}>
                        <RiskIcon className="w-3.5 h-3.5" />
                        <span>{config.label}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col gap-3">
                    {/* Bias + Emoji */}
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{conclusion.emoji}</span>
                        <div>
                            <h2 className={cn("text-xl font-bold", config.color)}>
                                今日市場：{conclusion.bias}
                            </h2>
                            <p className="text-sm text-neutral-400">
                                {config.sublabel}
                            </p>
                        </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="bg-black/20 rounded-xl p-3">
                        <p className="text-sm text-white font-medium">
                            {conclusion.action}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                            依據：{conclusion.reasoning}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/market"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300 hover:bg-white/10 transition-colors"
                        >
                            <span>查看依據</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            href="/reviews"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300 hover:bg-white/10 transition-colors"
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>相似歷史</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
