'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'

interface DecisionCardProps {
    /** 🧠 市場目前在做什麼？ */
    marketState: string
    /** ⚠️ 現在最大的風險是什麼？ */
    risk: string
    /** ✅ 現在比較合理的行為是？ */
    action: string
}

export function DecisionCard({ marketState, risk, action }: DecisionCardProps) {
    return (
        <section className="px-5 mb-5">
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-white/10 shadow-sm">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    市場解讀
                </h2>
                <div className="space-y-4">
                    {/* 🧠 市場目前在做什麼？ */}
                    <div className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">🧠</span>
                        <div>
                            <span className="text-[10px] text-neutral-500 font-bold block mb-0.5">市場目前在做什麼？</span>
                            <p className="text-sm text-neutral-200 leading-snug font-medium">{marketState}</p>
                        </div>
                    </div>
                    {/* ⚠ 現在最大的風險是什麼？ */}
                    <div className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">⚠️</span>
                        <div>
                            <span className="text-[10px] text-neutral-500 font-bold block mb-0.5">現在最大的風險是什麼？</span>
                            <p className="text-sm text-amber-400/90 leading-snug font-medium">{risk}</p>
                        </div>
                    </div>
                    {/* ✅ 現在比較合理的行為是？ */}
                    <div className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">✅</span>
                        <div>
                            <span className="text-[10px] text-neutral-500 font-bold block mb-0.5">現在比較合理的行為是？</span>
                            <p className="text-sm text-green-400/90 leading-snug font-medium">{action}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
