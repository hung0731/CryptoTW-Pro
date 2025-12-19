'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Activity } from 'lucide-react'
import { MarketStatusData, Conclusion } from '@/lib/types'

interface MarketRadarHeroProps {
    status: MarketStatusData | null
    conclusion: Conclusion | null
}

export function MarketRadarHero({ status, conclusion }: MarketRadarHeroProps) {
    // Default fallback
    const riskStatus = status?.market_structure?.bias || '中性'
    const score = conclusion?.sentiment_score || 50
    const riskLevel = score >= 75 ? 'RISK_ON' : score <= 25 ? 'RISK_OFF' : 'NEUTRAL'

    const getStatusColor = (level: string) => {
        switch (level) {
            case 'RISK_ON': return 'text-emerald-500 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
            case 'RISK_OFF': return 'text-red-500 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            default: return 'text-blue-400 border-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.2)]'
        }
    }

    const themeColor = getStatusColor(riskLevel)

    return (
        <div className="relative w-full aspect-[2/1] bg-[#0A0A0A] border-y border-[#1A1A1A] overflow-hidden flex flex-col items-center justify-center mb-6">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Central Status */}
            <div className="relative z-10 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#404040] text-xs font-mono tracking-[0.2em] mb-4">
                    <Activity className="w-3 h-3" />
                    <span>市場雷達系統 (BETA)</span>
                </div>

                <h1 className={cn(
                    "text-5xl font-black font-mono tracking-tighter transition-all duration-500",
                    themeColor.split(' ')[0], // Get text color
                    "drop-shadow-2xl"
                )}>
                    {riskLevel === 'RISK_ON' ? '積極進攻' : riskLevel === 'RISK_OFF' ? '保守防禦' : '中性震盪'}
                </h1>

                <div className={cn(
                    "inline-block px-3 py-1 bg-black/50 backdrop-blur border rounded text-xs font-bold tracking-widest mt-2",
                    themeColor.split(' ')[1] // Get border color
                )}>
                    得分: {score} // {riskStatus}
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#333]" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#333]" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#333]" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#333]" />
        </div>
    )
}
