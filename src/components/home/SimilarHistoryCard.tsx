'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data'
import { cn } from '@/lib/utils'

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

// Match score calculation
function calculateSimilarity(status: MarketStatus, event: MarketEvent): number {
    let score = 0
    const maxScore = 5

    if (status.sentiment.code === 'fear' && event.marketStates.includes('極恐')) score += 1
    if (status.sentiment.code === 'greed' && event.marketStates.includes('過熱')) score += 1
    if (status.leverage.code === 'overheated' && event.marketStates.includes('崩跌')) score += 1
    if (status.leverage.code === 'cool' && event.marketStates.includes('修復')) score += 0.5
    if (status.regime.code === 'pressure' && event.marketStates.includes('崩跌')) score += 1
    if (status.volatility.code === 'high' && event.reactionType === 'liquidity_crisis') score += 1
    if (status.whale.code === 'bearish' && event.reactionType === 'trust_collapse') score += 0.5

    return Math.min(score / maxScore, 1)
}

function findBestMatch(status: MarketStatus): { event: MarketEvent; similarity: number } | null {
    const matches = REVIEWS_DATA.map(event => ({
        event,
        similarity: calculateSimilarity(status, event)
    })).filter(m => m.similarity > 0.2)
        .sort((a, b) => b.similarity - a.similarity)

    return matches[0] || null
}

// Mini impact bar (like event reaction bar)
function ImpactBar({ impact }: { impact: number }) {
    const absImpact = Math.abs(impact)
    const filled = Math.min(Math.round(absImpact / 10), 10)
    const isNegative = impact < 0

    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1.5 h-2.5 rounded-sm",
                        i < filled
                            ? isNegative ? "bg-red-500" : "bg-emerald-500"
                            : "bg-white/10"
                    )}
                />
            ))}
        </div>
    )
}

const reactionTypeLabels: Record<string, string> = {
    trust_collapse: '信任崩壞',
    liquidity_crisis: '流動性危機',
    priced_in: '利多出盡',
    external_shock: '外部衝擊',
}

export function SimilarHistoryCard() {
    const [status, setStatus] = useState<MarketStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/status')
                if (!res.ok) throw new Error('API Error')
                const json = await res.json()
                if (json.status) setStatus(json.status)
            } catch (e) {
                console.error('SimilarHistoryCard fetch error:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-24 w-full bg-[#0E0E0F] rounded-xl" />
    }

    if (!status) return null

    const match = findBestMatch(status)
    if (!match) return null

    const { event, similarity } = match
    const similarityPercent = Math.round(similarity * 100)

    // Extract impact from event (assume -30% for demo, should come from data)
    const impact = event.reactionType === 'trust_collapse' ? -35 :
        event.reactionType === 'liquidity_crisis' ? -25 : -15

    return (
        <Link
            href={`/reviews/${event.year}/${event.slug}`}
            className={cn(
                "block bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl p-3",
                "hover:bg-[#141414] hover:border-[#2A2A2A]"
            )}
        >
            {/* Header: Badge + Event Title */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 rounded">
                        🔄 相似歷史
                    </span>
                    <span className="text-[10px] text-neutral-500">
                        {similarityPercent}% 吻合
                    </span>
                </div>
                <span className="text-[10px] text-neutral-600">{event.year}</span>
            </div>

            {/* Event Name */}
            <h4 className="text-sm font-bold text-white mb-2">
                {event.title.split('：')[0]}
            </h4>

            {/* Impact Bar */}
            <div className="mb-2">
                <ImpactBar impact={impact} />
            </div>

            {/* Historical Context - Dense */}
            <div className="text-[11px] text-neutral-400 mb-2">
                <span>{reactionTypeLabels[event.reactionType]}｜</span>
                <span className={cn(
                    "font-bold",
                    impact < -20 ? "text-red-400" : "text-neutral-300"
                )}>
                    BTC {impact}%
                </span>
            </div>

            {/* Cognitive CTA */}
            <div className="text-[10px] text-neutral-500">
                → 對比現在市場
            </div>
        </Link>
    )
}
