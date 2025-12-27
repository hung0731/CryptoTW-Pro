'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles, Newspaper, Activity, ChevronRight } from 'lucide-react'

// Mock Data
const MOCK_SUMMARY = "比特幣（BTC）近期在 9.2 萬美元水平盤整，主要受到聯準會（Fed）官員鷹派言論影響，市場對降息預期降溫。與此同時，以太坊（ETH）受惠於 Layer 2 活躍度提升，相對強勢。鏈上數據顯示，長期持有者（LTH）開始微幅減倉，顯示部分獲利了結賣壓浮現，但整體多頭結構尚未破壞。短線需留意 9 萬美元支撐，若跌破可能引發較大回調。"

const MOCK_RECOMMENDATIONS = [
    { title: "2023 相似回調回顧", path: "/reviews/2023/similar-drop" },
    { title: "資金費率指標詳解", path: "/indicators/funding-rate" }
]

type VisualVariant = 'baseline' | 'gradient' | 'glow' | 'glass' | 'combined'

interface TestCardProps {
    variant: VisualVariant
    title: string
}

function TestCard({ variant, title }: TestCardProps) {
    // Determine classes based on variant
    const isGradient = variant === 'gradient' || variant === 'combined'
    const isGlow = variant === 'glow' || variant === 'combined'
    const isGlass = variant === 'glass' || variant === 'combined'
    const isBaseline = variant === 'baseline'

    // 1. Wrapper Classes (Border & Glow)
    const wrapperClasses = cn(
        "relative rounded-xl overflow-hidden p-[1px] mb-8",
        // Glow Effect
        isGlow && "shadow-[0_0_20px_-5px_rgba(139,92,246,0.15)]", // Soft purple shadow
        // Baseline doesn't have shadow here usually
    )

    // 2. Animated Border Layer
    // Baseline: bg-purple-500 animate-breath
    // Gradient: bg-gradient-to-br from-purple-500 to-indigo-500 animate-breath
    const borderClasses = cn(
        "absolute inset-0 animate-breath",
        isGradient ? "bg-gradient-to-br from-[#8B5CF6] via-[#6366f1] to-[#8B5CF6]" : "bg-[#8B5CF6]"
    )

    // 3. Inner Background (Glass vs Solid)
    const contentClasses = cn(
        "relative h-full w-full rounded-xl overflow-hidden p-5",
        isGlass ? "bg-[#0A0A0A]/80 backdrop-blur-md" : "bg-[#0A0A0A]"
    )

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h3 className="text-neutral-400 text-sm mb-3 font-mono uppercase tracking-wider pl-1">
                {title}
            </h3>

            <div className={wrapperClasses}>
                {/* Border Layer */}
                <div className={borderClasses} />

                {/* Content Layer */}
                <div className={contentClasses}>
                    <div className="relative z-10 min-h-[60px]">
                        <p className="leading-relaxed text-neutral-300 text-sm">
                            {MOCK_SUMMARY}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className={cn(
                        "flex items-center justify-between border-t border-white/5",
                        isGlass ? "bg-white/5" : "bg-[#0F0F10]",
                        "mt-4 -mx-5 -mb-5 px-4 py-2.5"
                    )}>
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Newspaper strokeWidth={1.5} className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-medium text-[11px]">市場分析</span>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                <Sparkles strokeWidth={1.5} className="w-2.5 h-2.5 text-purple-400" />
                                <span className="text-[8px] font-bold text-purple-300 uppercase tracking-wider">AI</span>
                            </div>
                        </div>
                        <span className="font-bold tracking-wide text-purple-300 text-[11px]">
                            加密台灣 Pro
                        </span>
                    </div>
                </div>

                {/* Recommendations */}
                <div className={cn(
                    "border-t border-white/5 px-4 py-3",
                    isGlass ? "bg-black/40" : "bg-[#0A0A0A]/50"
                )}>
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-bold text-purple-400/70 tracking-wider">
                            💡 推薦閱讀
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {MOCK_RECOMMENDATIONS.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "group relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-300",
                                        isGlass
                                            ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-purple-500/30"
                                            : "bg-[#0F0F10] border-[#1A1A1A] hover:bg-[#141414] hover:border-purple-500/30"
                                    )}
                                >
                                    <div className="shrink-0 w-8 h-8 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-colors">
                                        <Activity className="w-4 h-4 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors truncate">
                                            {rec.title}
                                        </h4>
                                        <p className="text-[10px] text-neutral-500 mt-0.5 truncate group-hover:text-neutral-400 transition-colors">
                                            查看市場數據指標詳情
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TestAiVisualsPage() {
    return (
        <div className="min-h-screen bg-black p-8 pb-32">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-white">AI Summary Card Visual Experiments</h1>
                    <p className="text-neutral-500">
                        Comparing different visual treatments for the AI Summary Card. <br />
                        Trying to achieve a "Premium / Apple Sports" feel.
                    </p>
                </div>

                <div className="grid gap-12">
                    <TestCard variant="baseline" title="1. Baseline (Current)" />
                    <TestCard variant="gradient" title="2. Gradient Flow Border (Purple -> Indigo)" />
                    <TestCard variant="glow" title="3. Soft Glow (Box Shadow)" />
                    <TestCard variant="glass" title="4. Glass Effect (Transparent BG)" />
                    <TestCard variant="combined" title="5. Combined (All Effects)" />
                </div>
            </div>
        </div>
    )
}
