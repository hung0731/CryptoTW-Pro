'use client'

import React from 'react'

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
        <section className="p-4 space-y-3 border-b border-white/5">
            <h2 className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
                事件前情與市場狀態
            </h2>
            <div className="space-y-3">
                {/* 市場主流敘事 */}
                <div className="rounded-lg p-3.5 border border-white/5" style={{ backgroundColor: '#0F0F10' }}>
                    <span className="text-[10px] text-neutral-600 block mb-1">市場主流敘事</span>
                    <p className="text-sm text-neutral-300 leading-relaxed">{narrative}</p>
                </div>
                {/* 實際市場結構 */}
                <div className="rounded-lg p-3.5 border border-white/5" style={{ backgroundColor: '#0F0F10' }}>
                    <span className="text-[10px] text-neutral-600 block mb-2">實際市場結構</span>
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded border border-white/5">
                            {marketState.price}
                        </span>
                        <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded border border-white/5">
                            {marketState.fearGreed}
                        </span>
                        {marketState.metric && (
                            <span className="text-xs bg-neutral-800 text-neutral-500 px-2 py-1 rounded border border-white/5">
                                {marketState.metric}
                            </span>
                        )}
                    </div>
                </div>
                {/* 關鍵錯位 */}
                <div className="rounded-lg p-3.5 border border-white/5" style={{ backgroundColor: '#0F0F10' }}>
                    <span className="text-[10px] text-neutral-600 block mb-1">關鍵錯位</span>
                    <p className="text-sm text-neutral-200 leading-relaxed font-medium">{gap}</p>
                </div>
            </div>
        </section>
    )
}
