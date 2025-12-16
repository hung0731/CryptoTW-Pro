'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data'
import { History, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CARDS, SPACING } from '@/lib/design-tokens'

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

    // 1. Sentiment match (恐慌 -> 極恐 events, 貪婪 -> 過熱 events)
    if (status.sentiment.code === 'fear' && event.marketStates.includes('極恐')) score += 1
    if (status.sentiment.code === 'greed' && event.marketStates.includes('過熱')) score += 1

    // 2. Leverage match (overheated -> 崩跌 events)
    if (status.leverage.code === 'overheated' && event.marketStates.includes('崩跌')) score += 1
    if (status.leverage.code === 'cool' && event.marketStates.includes('修復')) score += 0.5

    // 3. Regime match
    if (status.regime.code === 'pressure' && event.marketStates.includes('崩跌')) score += 1

    // 4. Volatility match
    if (status.volatility.code === 'high' && event.reactionType === 'liquidity_crisis') score += 1

    // 5. Whale direction
    if (status.whale.code === 'bearish' && event.reactionType === 'trust_collapse') score += 0.5

    return Math.min(score / maxScore, 1) // Normalize to 0-1
}

function findBestMatch(status: MarketStatus): { event: MarketEvent; similarity: number } | null {
    const matches = REVIEWS_DATA.map(event => ({
        event,
        similarity: calculateSimilarity(status, event)
    })).filter(m => m.similarity > 0.2) // Minimum threshold
        .sort((a, b) => b.similarity - a.similarity)

    return matches[0] || null
}

// Reaction type labels
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
        return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!status) {
        return null
    }

    const match = findBestMatch(status)

    if (!match) {
        return null // No similar history found
    }

    const { event, similarity } = match
    const similarityPercent = Math.round(similarity * 100)

    return (
        <Link href={`/reviews/${event.slug}`} className="block group">
            <div className={cn(CARDS.secondary, SPACING.card)}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <History className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                    相似歷史
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                    相似度 {similarityPercent}%
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-[#3B82F6] truncate">
                                {event.title.split('：')[0]}
                            </h3>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                {event.year} · {reactionTypeLabels[event.reactionType] || event.reactionType}
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-[#3B82F6] flex-shrink-0 mt-2" />
                </div>

                {/* Context hint */}
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Sparkles className="w-3 h-3" />
                        <span>目前市場狀態與此事件發展前相似</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
