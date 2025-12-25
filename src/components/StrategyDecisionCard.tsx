'use client'

import React from 'react'

interface StrategyDecisionCardProps {
    /** 🧠 市場目前在做什麼？ */
    marketState: string
    /** ⚠️ 現在最大的風險是什麼？ */
    risk: string
    /** ✅ 現在比較合理的行為是？ */
    action: string
}

export function StrategyDecisionCard({ marketState, risk, action }: StrategyDecisionCardProps) {
    return (
        <section className="px-5 mb-4">
            <div className="rounded-lg p-4 border border-white/5" style={{ backgroundColor: '#0F0F10' }}>
                <h2 className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest mb-4">
                    市場解讀
                </h2>
                <div className="space-y-4">
                    {/* 🧠 市場目前在做什麼？ */}
                    <div>
                        <span className="text-[10px] text-neutral-600 block mb-1">市場目前在做什麼？</span>
                        <p className="text-sm text-neutral-200 leading-relaxed">{marketState}</p>
                    </div>
                    {/* ⚠ 現在最大的風險是什麼？ */}
                    <div>
                        <span className="text-[10px] text-neutral-600 block mb-1">現在最大的風險是什麼？</span>
                        <p className="text-sm text-neutral-300 leading-relaxed">{risk}</p>
                    </div>
                    {/* ✅ 現在比較合理的行為是？ */}
                    <div>
                        <span className="text-[10px] text-neutral-600 block mb-1">現在比較合理的行為是？</span>
                        <p className="text-sm text-neutral-300 leading-relaxed">{action}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
