'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextBlockProps {
    /** 市場主流敘事 - 當時大家「以為」發生了什麼 */
    narrative: string
    /** 實際市場結構 - 當時市場「實際」長什麼樣 */
    marketState: {
        price: string
        fearGreed: string
        metric?: string // OI or Funding
    }
    /** 關鍵錯位 - 敘事與結構的落差 */
    gap: string
}

export function ContextBlock({ narrative, marketState, gap }: ContextBlockProps) {
    return (
        <section className="p-5 space-y-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                🧭 事件前情與市場狀態校正
            </h2>
            <div className="space-y-4">
                {/* 市場主流敘事 */}
                <div className="bg-neutral-900/30 rounded-lg p-4 border border-white/5">
                    <span className="text-[10px] text-neutral-500 font-bold block mb-1.5">市場主流敘事</span>
                    <p className="text-xs text-neutral-500 mb-2">當時大家「以為」發生了什麼</p>
                    <p className="text-sm text-neutral-300 leading-relaxed">{narrative}</p>
                </div>
                {/* 實際市場結構 */}
                <div className="bg-neutral-900/30 rounded-lg p-4 border border-white/5">
                    <span className="text-[10px] text-neutral-500 font-bold block mb-1.5">實際市場結構</span>
                    <p className="text-xs text-neutral-500 mb-2">當時市場「實際」長什麼樣</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                        <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-white/5">
                            {marketState.price}
                        </span>
                        <span className={cn(
                            "text-xs px-2 py-1 rounded border border-white/5",
                            marketState.fearGreed.includes('貪婪') ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"
                        )}>
                            {marketState.fearGreed}
                        </span>
                        {marketState.metric && (
                            <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded border border-white/5">
                                {marketState.metric}
                            </span>
                        )}
                    </div>
                </div>
                {/* 關鍵錯位 */}
                <div className="bg-amber-950/10 rounded-lg p-4 border border-amber-500/20">
                    <span className="text-[10px] text-amber-500/80 font-bold block mb-1.5">關鍵錯位</span>
                    <p className="text-xs text-amber-500/60 mb-2">敘事與結構的落差</p>
                    <p className="text-sm text-amber-300 leading-relaxed font-medium">{gap}</p>
                </div>
            </div>
        </section>
    )
}
