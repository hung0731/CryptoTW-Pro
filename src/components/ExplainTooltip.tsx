'use client'

import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

// 雙層決策時間軸卡片類型
interface TimelineCard {
    type: 'anomaly' | 'risk' | 'event' | 'reversal' | 'lesson'
    time: string
    icon: string
    marketState: string    // 上半部：市場狀態（客觀）
    action: string         // 下半部：當下該做的事（主角）
    ifIgnored?: string     // 可選：如果忽略會怎樣
}

interface TimelineCase {
    id: string
    title: string
    cards: TimelineCard[]
}

interface ExplainTooltipProps {
    term: string
    definition: React.ReactNode
    explanation?: React.ReactNode
    timeline?: TimelineCase
    trigger?: React.ReactNode
}

/**
 * ExplainTooltip - 雙層決策時間軸
 * 
 * 📘 L1: 這是什麼（定義）
 * 💡 L2: 如何解讀（交易意義）
 * 🕒 L3: 決策時間軸：市場狀態 + 當下該做的事
 */
export function ExplainTooltip({ term, definition, explanation, timeline, trigger }: ExplainTooltipProps) {
    const [showTimeline, setShowTimeline] = useState(false)

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <button className="inline-flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors ml-1 align-middle">
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                )}
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-neutral-900 border-t border-white/10 rounded-t-[20px] pb-12 pt-6 px-0 focus:outline-none max-h-[85vh] overflow-y-auto">
                {/* Drag handle */}
                <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />

                <SheetHeader className="text-left px-6 space-y-4">
                    <div className="space-y-3">
                        <SheetTitle className="text-2xl font-bold text-white tracking-tight">{term}</SheetTitle>
                        <div className="text-base text-neutral-300 font-medium leading-relaxed">
                            {definition}
                        </div>
                    </div>
                </SheetHeader>

                {explanation && (
                    <div className="px-6 mt-6">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                💡 如何解讀？
                            </h4>
                            <div className="text-sm text-neutral-300 leading-relaxed">
                                {explanation}
                            </div>
                        </div>
                    </div>
                )}

                {/* 雙層決策時間軸 */}
                {timeline && timeline.cards.length > 0 && (
                    <div className="px-6 mt-6">
                        <button
                            onClick={() => setShowTimeline(!showTimeline)}
                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 rounded-xl border border-white/5 transition-colors"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                                <Clock className="w-4 h-4" />
                                {timeline.title}
                            </span>
                            {showTimeline ? (
                                <ChevronUp className="w-4 h-4 text-neutral-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-neutral-500" />
                            )}
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTimeline ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <div className="relative pl-6">
                                {/* 時間軸線 */}
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/10" />

                                <div className="space-y-4">
                                    {timeline.cards.map((card, index) => (
                                        <div key={index} className="relative">
                                            {/* 時間點 */}
                                            <div className="absolute -left-6 top-1 w-4 h-4 flex items-center justify-center">
                                                <span className="text-sm">{card.icon}</span>
                                            </div>

                                            {/* 卡片內容 */}
                                            <div className={`rounded-xl overflow-hidden ${card.type === 'lesson'
                                                    ? 'bg-blue-500/10 border border-blue-500/20'
                                                    : 'bg-white/5 border border-white/5'
                                                }`}>
                                                {/* 上半部：市場狀態（灰字，客觀） */}
                                                <div className="p-3 border-b border-white/5">
                                                    {card.time && (
                                                        <div className="text-xs text-neutral-500 mb-1">
                                                            🕒 {card.time}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-neutral-400">
                                                        市場狀態：
                                                    </div>
                                                    <div className="text-sm text-neutral-300 mt-0.5">
                                                        {card.marketState}
                                                    </div>
                                                </div>

                                                {/* 下半部：當下該做的事（白字，主角） */}
                                                <div className="p-3 bg-white/3">
                                                    <div className="text-xs text-emerald-400/80">
                                                        當下該做的事：
                                                    </div>
                                                    <div className={`text-sm font-medium mt-0.5 ${card.type === 'lesson' ? 'text-blue-400' : 'text-white'
                                                        }`}>
                                                        {card.action}
                                                    </div>

                                                    {/* 如果忽略（小字，可選） */}
                                                    {card.ifIgnored && (
                                                        <div className="text-xs text-red-400/60 mt-2 italic">
                                                            ⚠️ 如果忽略：{card.ifIgnored}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

