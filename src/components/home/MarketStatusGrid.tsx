'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { CARDS, SPACING } from '@/lib/design-tokens'
import { ChevronRight, Check, AlertTriangle, X } from 'lucide-react'

import { MarketStatusData, Conclusion } from '@/lib/types'

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
        ok: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', Icon: Check },
        warn: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', Icon: AlertTriangle },
        danger: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', Icon: X },
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
                    const res = await fetch('/api/market/status')
                    const json = await res.json()
                    if (json.status) setData(json.status)
                } catch (e) { console.error(e) }
            }, 60000)
            return () => clearInterval(interval)
        }

        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/market/status')
                if (!res.ok) throw new Error('API Error')
                const json = await res.json()
                if (json.status) setData(json.status)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
        const interval = setInterval(fetchStatus, 60000)
        return () => clearInterval(interval)
    }, [initialStatus])

    if (loading && !data) {
        return <Skeleton className="h-28 w-full bg-[#0A0A0A] rounded-xl" />
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
        <div className={cn(CARDS.secondary, "p-4")}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">市場快照</h3>
                {dangerCount > 0 ? (
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        {dangerCount} 項警示
                    </span>
                ) : warnCount > 0 ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {warnCount} 項留意
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        全部正常
                    </span>
                )}
            </div>

            {/* Status Grid - 填滿空白 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {checks.slice(0, 3).map((check) => (
                    <StatusBadge key={check.type} type={check.icon} text={check.text} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {checks.slice(3).map((check) => (
                    <StatusBadge key={check.type} type={check.icon} text={check.text} />
                ))}
            </div>

            {/* CTA */}
            <Link
                href="/prediction"
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-400 hover:text-white hover:bg-white/10"
            >
                <span>檢查風險訊號</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    )
}
