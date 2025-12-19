'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MarketStatusData } from '@/lib/types'
import { Users, BrainCircuit } from 'lucide-react'

interface SmartMoneyConflictProps {
    status: MarketStatusData | null
}

export function SmartMoneyConflict({ status }: SmartMoneyConflictProps) {
    const retailRatio = status?.long_short?.ratio || 1.1
    const retailBias = retailRatio > 1.2 ? '偏多' : retailRatio < 0.8 ? '偏空' : '中性'

    // Simulate Smart Money (inverse of retail if extreme, or huge whales)
    const smartMoneyBias = retailBias === '偏多' ? '偏空' : retailBias === '偏空' ? '偏多' : '觀望'

    return (
        <div className="grid grid-cols-2 gap-px bg-[#1A1A1A] border border-[#1A1A1A] rounded-xl overflow-hidden mb-6 h-28">
            {/* Retail Side (Dim/Gray) - "The Herd" */}
            <div className="bg-[#050505] p-3 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-900/50" />

                <div className="relative z-10 flex items-center gap-1.5 text-neutral-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono tracking-wider">散戶 (RETAIL)</span>
                </div>

                <div className="relative z-10 space-y-1">
                    <div className="text-2xl font-bold text-neutral-400 group-hover:text-neutral-300 transition-colors">
                        {retailBias}
                    </div>
                    <div className="text-[10px] text-neutral-600 font-mono">
                        多空比: {retailRatio}
                    </div>
                </div>
            </div>

            {/* Smart Money Side (Bright/Blue) - "The Driver" */}
            <div className="bg-[#08080A] p-3 flex flex-col justify-between relative overflow-hidden">
                {/* Active scan line effect */}
                <div className="absolute inset-0 bg-blue-500/5 z-0" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/30 animate-scan" />

                <div className="relative z-10 flex items-center gap-1.5 text-blue-400">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono tracking-wider text-blue-400 shadow-blue-500/50 drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]">
                        主力 (SMART MONEY)
                    </span>
                </div>

                <div className="relative z-10 space-y-1 text-right">
                    <div className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {smartMoneyBias}
                    </div>
                    <div className="text-[10px] text-blue-400/60 font-mono">
                        主導性: 高
                    </div>
                </div>
            </div>
        </div>
    )
}
