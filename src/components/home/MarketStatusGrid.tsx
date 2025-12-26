'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SPACING, SURFACE, BORDER } from '@/lib/design-tokens'
import { UniversalCard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/UniversalCard'
import { ChevronRight, Check, AlertTriangle, X } from 'lucide-react'

import { MarketStatusData, Conclusion } from '@/lib/schemas/market'
import { getMarketStatusAction } from '@/app/actions/market'

interface MarketStatusGridProps {
    initialStatus: MarketStatusData | null
    initialConclusion: Conclusion | null
}

// Semantic status mapping
const getSemanticStatus = (code: string, type: string): { icon: 'ok' | 'warn' | 'danger', text: string } => {
    switch (type) {
        case 'regime':
            if (code === 'stable') return { icon: 'ok', text: '盤面穩' }
            if (code === 'volatile') return { icon: 'warn', text: '震盪中' }
            return { icon: 'danger', text: '壓力大' }
        case 'leverage':
            if (code === 'cool') return { icon: 'ok', text: '槓桿冷' }
            if (code === 'warm') return { icon: 'warn', text: '槓桿熱' }
            return { icon: 'danger', text: '過熱' }
        case 'sentiment':
            if (code === 'fear') return { icon: 'ok', text: '恐慌區' }
            if (code === 'neutral') return { icon: 'warn', text: '中性' }
            return { icon: 'danger', text: '貪婪區' }
        case 'whale':
            if (code === 'bullish') return { icon: 'ok', text: '大戶多' }
            if (code === 'watch') return { icon: 'warn', text: '觀望' }
            return { icon: 'danger', text: '大戶空' }
        case 'volatility':
            if (code === 'low') return { icon: 'ok', text: '平靜' }
            if (code === 'medium') return { icon: 'warn', text: '波動' }
            return { icon: 'danger', text: '劇烈' }
        default:
            return { icon: 'warn', text: '—' }
    }
}

const StatusBadge = ({ type, text }: { type: 'ok' | 'warn' | 'danger', text: string }) => {
    const config = {
        ok: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', Icon: Check },
        warn: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', Icon: AlertTriangle },
        danger: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', Icon: X },
    }
    const c = config[type]

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border",
            c.bg, c.border
        )}>
            <c.Icon className={cn("w-3.5 h-3.5", c.text)} />
            <span className={cn("text-xs font-medium", c.text)}>{text}</span>
        </div>
    )
}

export function MarketStatusGrid({ initialStatus, initialConclusion }: MarketStatusGridProps) {
    const [data, setData] = useState<MarketStatusData | null>(initialStatus)
    const [loading, setLoading] = useState(!initialStatus)

    useEffect(() => {
        if (initialStatus) {
            const interval = setInterval(async () => {
                try {
                    const data = await getMarketStatusAction()
                    if (data?.status) setData(data.status)
                } catch (e) { console.error(e) }
            }, 60000)
            return () => clearInterval(interval)
        }

        const fetchStatus = async () => {
            try {
                const data = await getMarketStatusAction()
                if (data?.status) setData(data.status)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        void fetchStatus()
        const interval = setInterval(() => void fetchStatus(), 60000)
        return () => clearInterval(interval)
    }, [initialStatus])

    if (loading && !data) {
        return <Skeleton className="h-48 w-full bg-[#0A0A0A] rounded-xl" />
    }

    if (!data) return null

    const checks = [
        { label: '盤面', type: 'regime', ...getSemanticStatus(data.regime.code, 'regime') },
        { label: '槓桿', type: 'leverage', ...getSemanticStatus(data.leverage.code, 'leverage') },
        { label: '情緒', type: 'sentiment', ...getSemanticStatus(data.sentiment.code, 'sentiment') },
        { label: '大戶', type: 'whale', ...getSemanticStatus(data.whale.code, 'whale') },
        { label: '波動', type: 'volatility', ...getSemanticStatus(data.volatility.code, 'volatility') },
    ]

    // Count issues
    const dangerCount = checks.filter(c => c.icon === 'danger').length
    const warnCount = checks.filter(c => c.icon === 'warn').length

    return (
        <UniversalCard variant="luma" size="M">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between mb-3 space-y-0">
                <CardTitle>市場快照</CardTitle>
                {dangerCount > 0 ? (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        {dangerCount} 項警示
                    </span>
                ) : warnCount > 0 ? (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {warnCount} 項留意
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        全部正常
                    </span>
                )}
            </CardHeader>

            {/* Status Grid */}
            <CardContent>
                <div className={cn("grid grid-cols-3", SPACING.classes.gapCards, "mb-3")}>
                    {checks.slice(0, 3).map((check) => (
                        <StatusBadge key={check.type} type={check.icon} text={check.text} />
                    ))}
                </div>
                <div className={cn("grid grid-cols-2", SPACING.classes.gapCards)}>
                    {checks.slice(3).map((check) => (
                        <StatusBadge key={check.type} type={check.icon} text={check.text} />
                    ))}
                </div>
            </CardContent>

            {/* CTA */}
            <CardFooter className="mt-4 pt-0">
                <Link
                    href="/prediction"
                    className={cn(
                        "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors",
                        SURFACE.elevated,
                        BORDER.primary,
                        "text-neutral-400 hover:text-white hover:bg-[#1A1A1A]"
                    )}
                >
                    <span>檢查詳細風險訊號</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </CardFooter>
        </UniversalCard>
    )
}
