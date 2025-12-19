'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getFeaturedReviews, MarketEvent } from '@/lib/reviews-data'
import { Scale, ChevronRight, Clock } from 'lucide-react'

// --- COMPARISON ENTRY POINT (Special Card) ---
function ComparisonEntry() {
    return (
        <Link href="/reviews/compare" className="group relative flex items-center gap-4 py-3 pl-2">
            {/* Timeline Node */}
            <div className="flex flex-col items-center shrink-0 w-6 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-black shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 relative top-0.5" />
                <div className="w-px absolute top-3 left-1/2 -translate-x-1/2 bottom-[-1rem] bg-neutral-800 -z-0" />
            </div>

            {/* Card Content */}
            <div className="flex-1 bg-gradient-to-r from-blue-950/20 to-transparent border border-blue-900/30 rounded-lg p-3 group-hover:border-blue-500/50 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-blue-400 tracking-wide">進入歷史比對模式</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-500/50 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-blue-300/60 mt-1 pl-6">
                    兩段歷史行情疊加，尋找相似性
                </p>
            </div>
        </Link>
    )
}

// --- REVIEW ITEM (Timeline Style) ---
function ReviewTimelineItem({ event, isLast }: { event: MarketEvent, isLast: boolean }) {
    const isBull = ['priced_in', 'supply_shock'].includes(event.reactionType)
    const colorClass = isBull ? 'text-emerald-500' : 'text-neutral-400'
    const dotClass = isBull ? 'bg-emerald-500' : 'bg-neutral-600'

    return (
        <Link href={`/reviews/${event.year}/${event.slug}`} className="group relative flex gap-4 py-3 pl-2">

            {/* Timeline Node */}
            <div className="flex flex-col items-center shrink-0 w-6 relative">
                <div className={cn(
                    "w-2 h-2 rounded-full border border-black z-10 box-content ring-2 ring-black relative top-0.5",
                    dotClass
                )} />
                {!isLast && (
                    <div className={cn(
                        "w-px absolute top-3 left-1/2 -translate-x-1/2 bottom-[-1rem] -z-0 transition-colors bg-neutral-800 group-hover:bg-neutral-700"
                    )} />
                )}
            </div>

            {/* Content Content */}
            <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-baseline justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors truncate">
                        {event.title.split('：')[0]}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-600 shrink-0 ml-2">
                        {event.year}
                    </span>
                </div>

                <p className="text-[11px] text-neutral-500 line-clamp-1 group-hover:text-neutral-400 transition-colors">
                    {event.impactSummary}
                </p>
            </div>
        </Link>
    )
}

export function FeaturedReviewsCard() {
    let reviews = getFeaturedReviews().slice(0, 4)

    // Fallback if no reviews
    if (reviews.length === 0) {
        return null
    }

    return (
        <section className="mt-8">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Clock className="w-3 h-3 text-neutral-600" />
                <span className="text-[10px] font-mono text-[#666666] tracking-widest">歷史回顧 (ARCHIVES)</span>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-2 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                />

                <div className="relative z-10 flex flex-col">
                    {/* 1. Comparison Entry */}
                    <ComparisonEntry />

                    {/* 2. Reviews List */}
                    {reviews.map((event, i) => (
                        <ReviewTimelineItem
                            key={event.id}
                            event={event}
                            isLast={i === reviews.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
