'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { BrainCircuit, ChevronRight, Sparkles, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketReport {
    id: string
    created_at: string
    sentiment: 'Bullish' | 'Bearish' | 'Neutral'
    sentiment_score: number
    summary: string
    key_points: string[]
    strategy: string
    emoji?: string
    metrics?: {
        whale_ratio?: number
        global_ratio?: number
    }
}

export function AIMarketPulse() {
    const [report, setReport] = useState<MarketReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch('/api/market-summary')
                const json = await res.json()
                if (json.report) {
                    setReport(json.report)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [])

    if (loading) {
        return <Skeleton className="w-full h-24 rounded-xl bg-neutral-900/50 border border-white/5" />
    }

    if (!report) return null

    // Determine color based on sentiment for text highlights
    const sentimentColor =
        report.sentiment?.toLowerCase() === 'bullish' ? 'text-green-400' :
            report.sentiment?.toLowerCase() === 'bearish' ? 'text-red-400' :
                'text-blue-400'

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
            {/* Header / Summary */}
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Title Line */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {/* Emoji or Icon */}
                        <div className="w-5 h-5 flex items-center justify-center">
                            {report.emoji ? (
                                <span className="text-base leading-none">{report.emoji}</span>
                            ) : (
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            )}
                        </div>
                        <span className="text-xs font-bold text-white">AI 市場脈動</span>

                        {/* Score Tag */}
                        <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5", sentimentColor)}>
                            {report.sentiment_score}/100
                        </div>
                    </div>

                    {/* Timestamp & Expand Icon */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono">
                            {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-500 transition-transform", expanded && "rotate-180")} />
                    </div>
                </div>

                {/* Short Summary (Always Visible) */}
                <p className={cn("text-xs text-neutral-300 leading-relaxed font-light pl-7", !expanded && "line-clamp-2")}>
                    {report.summary}
                </p>
            </div>

            {/* Expanded Content (Details) */}
            {expanded && (
                <div className="px-3 pb-3 pl-10 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Key Factors */}
                    <div className="space-y-1.5">
                        {report.key_points?.map((point, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-neutral-600 mt-1.5 shrink-0" />
                                <span className="text-xs text-neutral-400 leading-snug">{point}</span>
                            </div>
                        ))}
                    </div>

                    {/* Strategy Box */}
                    <div className={cn(
                        "rounded-lg p-2.5 border text-xs leading-relaxed",
                        report.sentiment?.toLowerCase() === 'bullish' ? 'bg-green-500/5 border-green-500/10 text-green-200/90' :
                            report.sentiment?.toLowerCase() === 'bearish' ? 'bg-red-500/5 border-red-500/10 text-red-200/90' :
                                'bg-blue-500/5 border-blue-500/10 text-blue-200/90'
                    )}>
                        <span className="font-bold block mb-0.5 opacity-80">💡 操作建議:</span>
                        {report.strategy}
                    </div>

                    {/* Whale vs Retail Data (Requested Feature) */}
                    {report.metrics && (report.metrics.whale_ratio || report.metrics.global_ratio) && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                                <span className="text-[10px] text-neutral-500 block mb-0.5">🐋 大戶多空比</span>
                                <span className={cn(
                                    "text-base font-mono font-bold",
                                    (report.metrics.whale_ratio || 0) > 1.1 ? 'text-green-400' :
                                        (report.metrics.whale_ratio || 0) < 0.9 ? 'text-red-400' : 'text-neutral-300'
                                )}>
                                    {report.metrics.whale_ratio?.toFixed(2) || '--'}
                                </span>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                                <span className="text-[10px] text-neutral-500 block mb-0.5">👥 散戶多空比</span>
                                <span className={cn(
                                    "text-base font-mono font-bold",
                                    (report.metrics.global_ratio || 0) > 1.2 ? 'text-green-400' :
                                        (report.metrics.global_ratio || 0) < 0.8 ? 'text-red-400' : 'text-neutral-300'
                                )}>
                                    {report.metrics.global_ratio?.toFixed(2) || '--'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
