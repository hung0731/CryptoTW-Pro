'use client'

import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
 * Bloomberg-Level Timeline Design
 * 三層黑 + 總結突出 + 雙層極簡
 */
export function ExplainTooltip({ term, definition, explanation, timeline, trigger }: ExplainTooltipProps) {
    const [showTimeline, setShowTimeline] = useState(false)

    // 判斷是否為總結卡
    const isLessonCard = (type: string) => type === 'lesson'

    // 取得行動顏色
    const getActionColor = (type: string) => {
        switch (type) {
            case 'anomaly': return 'text-red-400'
            case 'risk': return 'text-yellow-400'
            case 'reversal': return 'text-emerald-400'
            case 'lesson': return 'text-blue-300'
            default: return 'text-neutral-400'
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <button className="inline-flex items-center justify-center text-neutral-600 hover:text-neutral-400 transition-colors ml-1 align-middle">
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                )}
            </SheetTrigger>
            {/* 主背景：純黑 #000 */}
            <SheetContent side="bottom" className="bg-black border-t border-white/5 rounded-t-[20px] pb-12 pt-6 px-0 focus:outline-none max-h-[85vh] overflow-y-auto">
                <div className="w-10 h-1 bg-neutral-800 rounded-full mx-auto mb-6" />

                <SheetHeader className="text-left px-6">
                    <SheetTitle className="text-xl font-semibold text-white tracking-tight leading-relaxed">
                        {term}
                    </SheetTitle>
                    <div className="text-sm text-neutral-400 leading-relaxed mt-2">
                        {definition}
                    </div>
                </SheetHeader>

                {/* 輔助說明條：退後、極簡 */}
                {explanation && (
                    <div className="px-6 mt-5">
                        <div className="flex items-start gap-2 text-xs text-neutral-500 leading-relaxed">
                            <span className="text-neutral-600 shrink-0">💡</span>
                            <span>{explanation}</span>
                        </div>
                    </div>
                )}

                {/* 水平決策時間軸 */}
                {timeline && timeline.cards.length > 0 && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowTimeline(!showTimeline)}
                            className="w-full flex items-center justify-between px-6 py-3 text-neutral-500 hover:text-neutral-400 transition-colors"
                        >
                            <span className="text-xs font-medium tracking-wide">
                                📅 {timeline.title}
                            </span>
                            {showTimeline ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        <div className={`transition-all duration-300 ease-out ${showTimeline ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                            {/* 區塊背景：#0B0B0B */}
                            <div className="bg-[#0B0B0B] py-4">
                                {/* 水平滑動 + 右側漸層消失 */}
                                <div className="relative">
                                    <div className="overflow-x-auto scrollbar-hide">
                                        <div className="flex gap-2.5 px-6 pb-2" style={{ width: 'max-content' }}>
                                            {timeline.cards.map((card, index) => {
                                                const isLesson = isLessonCard(card.type)

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex-none rounded-lg overflow-hidden ${isLesson
                                                                ? 'w-60 bg-[#181818] border border-white/10'
                                                                : 'w-52 bg-[#111]'
                                                            }`}
                                                    >
                                                        {/* 日期：極淡、極小 */}
                                                        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                                                            <span className="text-[10px] text-neutral-700 font-mono">
                                                                {card.time || '—'}
                                                            </span>
                                                            <span className={`text-sm ${isLesson ? 'opacity-100' : 'opacity-60'}`}>
                                                                {card.icon}
                                                            </span>
                                                        </div>

                                                        {/* 第一層：市場狀態（白、bold） */}
                                                        <div className="px-3 pb-2">
                                                            <div className={`text-[13px] leading-snug ${isLesson ? 'text-white font-semibold' : 'text-neutral-200 font-medium'
                                                                }`}>
                                                                {card.marketState}
                                                            </div>
                                                        </div>

                                                        {/* 第二層：當下該做（色彩區分） */}
                                                        <div className="px-3 pb-3">
                                                            <div className={`text-[11px] leading-relaxed ${getActionColor(card.type)}`}>
                                                                → {card.action}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* 右側漸層消失（peek 效果） */}
                                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0B0B0B] to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

