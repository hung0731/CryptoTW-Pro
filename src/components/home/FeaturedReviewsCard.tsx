'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getFeaturedReviews, MarketEvent } from '@/lib/reviews-data'

// Reaction type labels
const reactionTypeLabels: Record<string, string> = {
    trust_collapse: '信任崩壞',
    liquidity_crisis: '流動性危機',
    priced_in: '利多出盡',
    external_shock: '外部衝擊',
}

// Type labels
const typeLabels: Record<string, string> = {
    leverage_cleanse: '槓桿清洗',
    policy_regulation: '政策監管',
    market_structure: '市場結構',
    exchange_event: '交易所事件',
    macro_shock: '宏觀衝擊',
    tech_event: '技術事件',
    supply_shock: '供應衝擊',
    geopolitics: '地緣政治',
}

// Generate dynamic CTA based on event
function getEventCTA(event: MarketEvent): string {
    const title = event.title.toLowerCase()
    const reaction = event.reactionType

    // Specific event CTAs
    if (title.includes('ftx')) return '→ FTX 倒塌前有什麼跡象？'
    if (title.includes('luna') || title.includes('ust')) return '→ 穩定幣為何會崩盤？'
    if (title.includes('etf')) return '→ 為什麼說「買消息，賣事實」？'
    if (title.includes('covid') || title.includes('疫情')) return '→ 黑天鵝來臨時怎麼辦？'
    if (title.includes('日圓') || title.includes('套利')) return '→ 套利崩盤的連鎖反應？'
    if (title.includes('celsius') || title.includes('3ac')) return '→ 流動性危機如何蔓延？'
    if (title.includes('halving') || title.includes('減半')) return '→ 減半後真的會漲嗎？'

    // Reaction-type-based CTAs
    if (reaction === 'trust_collapse') return '→ 信任崩壞如何發生？'
    if (reaction === 'liquidity_crisis') return '→ 流動性危機的教訓？'
    if (reaction === 'external_shock') return '→ 外部衝擊後多久恢復？'
    if (reaction === 'priced_in') return '→ 利多出盡如何判斷？'

    // Default
    return '→ 這次事件學到什麼？'
}

// Determine trend direction based on reaction type
function getTrendDirection(reactionType: string): 'up' | 'down' {
    const bearishTypes = ['trust_collapse', 'liquidity_crisis', 'external_shock']
    return bearishTypes.includes(reactionType) ? 'down' : 'up'
}

// SVG trend line background
function TrendBackground({ direction }: { direction: 'up' | 'down' }) {
    const isUp = direction === 'up'

    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
        >
            <path
                d={isUp
                    ? "M0,50 Q20,45 35,35 T60,25 T85,15 L100,10 L100,60 L0,60 Z"
                    : "M0,10 Q20,15 35,25 T60,35 T85,45 L100,50 L100,60 L0,60 Z"
                }
                fill={isUp ? "rgb(34,197,94)" : "rgb(239,68,68)"}
            />
            <path
                d={isUp
                    ? "M0,50 Q20,45 35,35 T60,25 T85,15 L100,10"
                    : "M0,10 Q20,15 35,25 T60,35 T85,45 L100,50"
                }
                stroke={isUp ? "rgb(34,197,94)" : "rgb(239,68,68)"}
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
            />
        </svg>
    )
}

// Get primary token from impactedTokens
function getPrimaryToken(tokens: string[]): string {
    if (!tokens || tokens.length === 0) return 'btc'
    const token = tokens[0].toLowerCase()
    // Map common variations
    if (token.includes('btc') || token.includes('bitcoin')) return 'btc'
    if (token.includes('eth') || token.includes('ethereum')) return 'eth'
    if (token.includes('luna') || token.includes('ust')) return 'luna'
    if (token.includes('sol') || token.includes('solana')) return 'sol'
    if (token.includes('ftx') || token.includes('ftt')) return 'ftt'
    return 'btc' // default
}

export function FeaturedReviewsCard() {
    let reviews = getFeaturedReviews().slice(0, 3)

    if (reviews.length === 0) {
        const { REVIEWS_DATA } = require('@/lib/reviews-data')
        reviews = [...REVIEWS_DATA]
            .sort((a: MarketEvent, b: MarketEvent) => {
                const order = { S: 0, A: 1, B: 2 }
                return order[a.importance] - order[b.importance]
            })
            .slice(0, 3)
    }

    if (reviews.length === 0) return null

    return (
        <div className="overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            <div className="flex gap-3">
                {reviews.map((event: MarketEvent) => {
                    const trend = getTrendDirection(event.reactionType)
                    const primaryToken = getPrimaryToken(event.impactedTokens)

                    return (
                        <Link
                            key={event.id}
                            href={`/reviews/${event.year}/${event.slug}`}
                            className={cn(
                                "snap-start flex-none w-[240px] relative overflow-hidden",
                                "bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl p-3",
                                "hover:bg-[#141414] hover:border-[#2A2A2A]"
                            )}
                        >
                            {/* Trend Background */}
                            <TrendBackground direction={trend} />

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Header: Year Badge + Token Logo */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-neutral-400 bg-black border border-neutral-700 px-1.5 py-0.5 rounded">
                                        {event.year}
                                    </span>
                                    <Image
                                        src={`/tokens/${primaryToken}.png`}
                                        alt={primaryToken}
                                        width={20}
                                        height={20}
                                        className="rounded-full"
                                        onError={(e) => {
                                            // Fallback to BTC if token image not found
                                            (e.target as HTMLImageElement).src = '/tokens/btc.png'
                                        }}
                                    />
                                </div>

                                {/* Event Name */}
                                <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">
                                    {event.title.split('：')[0]}
                                </h4>

                                {/* Quick Insight */}
                                <div className="text-[11px] text-neutral-400 mb-3">
                                    <span className={cn(
                                        "font-bold",
                                        trend === 'down' ? "text-red-400" : "text-emerald-400"
                                    )}>
                                        {reactionTypeLabels[event.reactionType]}
                                    </span>
                                    <span>｜{event.impactSummary?.slice(0, 35) || typeLabels[event.type]}</span>
                                </div>

                                {/* CTA */}
                                <div className="text-[10px] text-neutral-500">
                                    {getEventCTA(event)}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
