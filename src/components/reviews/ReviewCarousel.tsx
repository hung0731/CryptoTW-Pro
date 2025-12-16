"use client";

import React from "react";
import Link from "next/link";
import { MarketEvent } from "@/lib/reviews-data";
import { cn } from "@/lib/utils";
import { ChevronRight, Star } from "lucide-react";

interface ReviewCarouselProps {
    items: MarketEvent[];
}

export function ReviewCarousel({ items }: ReviewCarouselProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full space-y-3 mb-8">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h2 className="text-lg font-bold text-white tracking-tight">編輯精選</h2>
                </div>
                {/* Optional View All */}
                {/* <Link href="#" className="text-xs text-neutral-500 flex items-center gap-1 hover:text-white transition-colors">
                    查看全部 <ChevronRight className="w-3 h-3" />
                </Link> */}
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 scrollbar-hide">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/reviews/${item.year}/${item.slug}`}
                        className="group relative flex-none w-[85vw] max-w-[320px] bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden snap-center hover:border-white/30 shadow-xl"
                    >
                        {/* Token Background (Optional visual flair) */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            {item.impactedTokens?.[0] && (
                                <img src={`/tokens/${item.impactedTokens[0]}.png`} className="w-32 h-32 grayscale" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                            )}
                        </div>

                        <div className="relative p-5 flex flex-col h-full bg-gradient-to-br from-white/[0.03] to-transparent">
                            {/* Top Badge */}
                            <div className="flex items-start justify-between mb-3">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border",
                                    item.importance === 'S'
                                        ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                                        : "text-neutral-400 border-neutral-700 bg-neutral-800"
                                )}>
                                    {item.importance} 級事件
                                </span>
                                <span className="font-mono text-xs text-neutral-500 font-bold">{item.year}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors">
                                {item.title.split('：')[0]}
                            </h3>

                            {/* Subtitle / Context */}
                            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-4 flex-grow">
                                {item.impactSummary || item.summary}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                                <div className="flex -space-x-1.5 overflow-hidden">
                                    {item.impactedTokens?.slice(0, 3).map(t => (
                                        <div key={t} className="w-5 h-5 rounded-full bg-black border border-neutral-800 flex items-center justify-center overflow-hidden">
                                            <img src={`/tokens/${t}.png`} className="w-full h-full object-cover" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-neutral-500 ml-auto flex items-center gap-1 group-hover:text-amber-500/80 transition-colors">
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

