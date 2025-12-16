'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ChevronRight, Shield } from 'lucide-react'

import { MarketStatusData, Conclusion } from '@/lib/types'

interface DecisionHeroProps {
    initialStatus: MarketStatusData | null
    initialConclusion: Conclusion | null
}

type BiasType = 'bullish' | 'bearish' | 'neutral'

// Determine bias from status
function determineBias(status: MarketStatusData): BiasType {
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

    if (bullishSignals >= 2) return 'bullish'
    if (bearishSignals >= 2) return 'bearish'
    return 'neutral'
}

// Visual config per bias
const biasConfig = {
    bullish: {
        gradient: 'from-emerald-950/80 via-emerald-900/40 to-transparent',
        accent: 'text-emerald-400',
        accentBg: 'bg-emerald-500/15',
        border: 'border-emerald-500/20',
        Icon: TrendingUp,
        label: '偏多',
    },
    bearish: {
        gradient: 'from-red-950/80 via-red-900/40 to-transparent',
        accent: 'text-red-400',
        accentBg: 'bg-red-500/15',
        border: 'border-red-500/20',
        Icon: TrendingDown,
        label: '偏空',
    },
    neutral: {
        gradient: 'from-amber-950/80 via-amber-900/40 to-transparent',
        accent: 'text-amber-400',
        accentBg: 'bg-amber-500/15',
        border: 'border-amber-500/20',
        Icon: Minus,
        label: '震盪',
    },
}

// Generate 2 non-technical reasons
function generateReasons(status: MarketStatusData): string[] {
    const reasons: string[] = []

    if (status.sentiment.code === 'fear') {
        reasons.push('散戶恐慌中')
    } else if (status.sentiment.code === 'greed') {
        reasons.push('市場過熱')
    } else {
        reasons.push('情緒平穩')
    }

    if (status.leverage.code === 'cool') {
        reasons.push('槓桿冷靜區')
    } else if (status.leverage.code === 'overheated') {
        reasons.push('槓桿過熱')
    } else {
        reasons.push('槓桿偏熱')
    }

    return reasons
}

export function DecisionHero({ initialStatus, initialConclusion }: DecisionHeroProps) {
    const [conclusion, setConclusion] = useState<Conclusion | null>(initialConclusion)
    const [status, setStatus] = useState<MarketStatusData | null>(initialStatus)
    const [loading, setLoading] = useState(!initialStatus || !initialConclusion)

    useEffect(() => {
        if (initialStatus && initialConclusion) return

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
    }, [initialStatus, initialConclusion])

    if (loading) {
        return <Skeleton className="h-36 w-full bg-neutral-900/50 rounded-2xl" />
    }

    if (!conclusion || !status) return null

    const bias = determineBias(status)
    const config = biasConfig[bias]
    const BiasIcon = config.Icon
    const reasons = generateReasons(status)

    return (
        <div className={cn(
            "relative rounded-2xl border overflow-hidden",
            "bg-[#0A0A0A]",
            config.border
        )}>
            {/* Gradient Overlay */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br pointer-events-none",
                config.gradient
            )} />

            {/* Content */}
            <div className="relative p-3">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                    {/* Bias Badge */}
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                        config.accentBg,
                        config.accent
                    )}>
                        <BiasIcon className="w-3.5 h-3.5" />
                        <span>{config.label}</span>
                    </div>

                    {/* Time indicator */}
                    <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} 更新
                    </span>
                </div>

                {/* Main Title */}
                <h2 className="text-lg font-bold text-white mb-0.5">
                    今日市場 <span className={config.accent}>{config.label}</span>
                </h2>

                {/* Action Line */}
                <p className="text-sm text-neutral-300 mb-2">
                    {conclusion.action}
                </p>

                {/* Reason Pills */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {reasons.map((reason, i) => (
                        <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5"
                        >
                            {reason}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <Link
                    href="/calendar"
                    className={cn(
                        "flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium",
                        "bg-white/5 border border-white/10 text-neutral-300",
                        "hover:bg-white/10 hover:text-white hover:border-white/20"
                    )}
                >
                    <Shield className="w-4 h-4" />
                    <span>查看判斷依據</span>
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
