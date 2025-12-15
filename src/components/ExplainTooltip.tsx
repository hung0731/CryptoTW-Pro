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
 * ExplainTooltip - 雙層決策時間軸（水平滑動式）
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
                            <h4 className="text-sm font-bold text-emerald-400 mb-3">
                                💡 如何解讀？
                            </h4>
                            <div className="text-sm text-neutral-300 leading-relaxed">
                                {explanation}
                            </div>
                        </div>
                    </div>
                )}

                {/* 水平決策時間軸 */}
                {timeline && timeline.cards.length > 0 && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowTimeline(!showTimeline)}
                            className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors"
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

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTimeline ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {/* 水平滑動容器 */}
                            <div className="overflow-x-auto pb-4 pt-2 scrollbar-hide">
                                <div className="flex gap-3 px-6" style={{ width: 'max-content' }}>
                                    {timeline.cards.map((card, index) => (
                                        <div
                                            key={index}
                                            className={`flex-none w-56 rounded-xl overflow-hidden ${card.type === 'lesson'
                                                    ? 'bg-blue-500/10 border-2 border-blue-500/30'
                                                    : 'bg-white/5 border border-white/10'
                                                }`}
                                        >
                                            {/* 頂部：時間 + 圖示 */}
                                            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-black/20">
                                                <span className="text-xs text-neutral-500 font-mono">
                                                    {card.time || '總結'}
                                                </span>
                                                <span className="text-base">{card.icon}</span>
                                            </div>

                                            {/* 市場狀態 */}
                                            <div className="px-3 py-2 border-b border-white/5">
                                                <div className="text-[10px] text-neutral-500 mb-1">市場狀態</div>
                                                <div className="text-xs text-neutral-300 leading-relaxed">
                                                    {card.marketState}
                                                </div>
                                            </div>

                                            {/* 當下該做的事 */}
                                            <div className="px-3 py-2 bg-white/3">
                                                <div className="text-[10px] text-emerald-400/80 mb-1">當下該做</div>
                                                <div className={`text-xs font-medium leading-relaxed ${card.type === 'lesson' ? 'text-blue-300' : 'text-white'
                                                    }`}>
                                                    {card.action}
                                                </div>

                                                {card.ifIgnored && (
                                                    <div className="text-[10px] text-red-400/60 mt-1.5 italic">
                                                        ⚠ {card.ifIgnored}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 滑動提示 */}
                            <div className="text-center text-[10px] text-neutral-600 pb-2">
                                ← 左右滑動查看完整時間軸 →
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

