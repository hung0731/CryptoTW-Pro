'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getFeaturedReviews, MarketEvent } from '@/lib/reviews-data'
import { Scale, ChevronRight, Clock } from 'lucide-react'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard } from '@/components/ui/UniversalCard'

// --- COMPARISON ENTRY POINT (Special Card) ---
// --- REVIEW COMPONENT ---
export function ReviewsFeaturedCard() {
    const reviews = getFeaturedReviews().slice(0, 4)

    // Fallback if no reviews
    if (reviews.length === 0) {
        return null
    }

    return (
        <div className="w-full mt-6">
            <UniversalCard variant="luma" className="p-0 overflow-hidden">
                {/* Header */}
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="歷史回顧"
                        icon={Clock}
                    />
                </div>

                {/* List Content */}
                <div className="flex flex-col relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                    />

                    <div className="relative z-10">
                        {/* 1. Comparison Entry */}
                        <Link href="/reviews/compare" className="group flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Scale className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-blue-400">進入歷史比對模式</h4>
                                    <p className="text-[10px] text-blue-300/60">兩段歷史行情疊加，尋找相似性</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-blue-500/50 group-hover:translate-x-1 transition-transform relative z-10" />
                        </Link>

                        {/* 2. Reviews List */}
                        {reviews.map((event) => (
                            <Link
                                key={event.id}
                                href={`/reviews/${event.year}/${event.slug}`}
                                className="group flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors"
                            >
                                <div className="flex flex-col gap-1 min-w-0 pr-4">
                                    <h4 className="text-sm font-bold text-[#E0E0E0] group-hover:text-white truncate transition-colors">
                                        {event.title.split('：')[0]}
                                    </h4>
                                    <p className="text-[11px] text-[#666] group-hover:text-[#888] line-clamp-1 truncate">
                                        {event.impactSummary}
                                    </p>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-[#525252] bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#2A2A2A]">
                                        {event.year}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </UniversalCard>
        </div>
    )
}
