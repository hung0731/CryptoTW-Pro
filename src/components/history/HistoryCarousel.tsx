"use client";

import React from "react";
import Link from "next/link";
import { MarketEvent } from "@/lib/reviews-data";
import { cn } from "@/lib/utils";
import { ChevronRight, Star } from "lucide-react";
import { CARDS, SPACING, TYPOGRAPHY, BADGES } from "@/lib/design-tokens";

interface ReviewCarouselProps {
    items: MarketEvent[];
}

export function ReviewCarousel({ items }: ReviewCarouselProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full space-y-3 mb-8">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <h2 className={TYPOGRAPHY.sectionTitle}>編輯精選</h2>
                </div>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 scrollbar-hide">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/reviews/${item.year}/${item.slug}`}
                        className={cn(
                            CARDS.secondary,
                            "group relative flex-none w-[85vw] max-w-[320px] overflow-hidden snap-center shadow-xl"
                        )}
                    >
                        {/* Token Background */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 pointer-events-none">
                            {item.impactedTokens?.[0] && (
                                <img src={`/tokens/${item.impactedTokens[0]}.png`} className="w-32 h-32 grayscale rounded-full" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                            )}
                        </div>

                        <div className={cn(SPACING.card, "relative flex flex-col h-full")}>
                            {/* Top Badge */}
                            <div className="flex items-start justify-between mb-3">
                                <span className={cn(
                                    BADGES.neutral,
                                    item.importance === 'S' && "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10"
                                )}>
                                    {item.importance} 級事件
                                </span>
                                <span className={TYPOGRAPHY.monoSmall}>{item.year}</span>
                            </div>

                            {/* Title */}
                            <h3 className={cn(TYPOGRAPHY.sectionTitle, "mb-2 leading-tight group-hover:text-white")}>
                                {item.title.split('：')[0]}
                            </h3>

                            {/* Subtitle */}
                            <p className={cn(TYPOGRAPHY.bodyDefault, "line-clamp-2 mb-4 flex-grow")}>
                                {item.impactSummary || item.summary}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center gap-2 pt-4 border-t border-[#1A1A1A] mt-auto">
                                <div className="flex -space-x-1.5 overflow-hidden">
                                    {item.impactedTokens?.slice(0, 3).map(t => (
                                        <div key={t} className="w-5 h-5 rounded-full bg-black border border-[#1A1A1A] flex items-center justify-center overflow-hidden">
                                            <img src={`/tokens/${t}.png`} className="w-full h-full object-cover" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>
                                    ))}
                                </div>
                                <span className={cn(TYPOGRAPHY.caption, "ml-auto flex items-center gap-1 group-hover:text-white")}>
                                    開始復盤 <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
