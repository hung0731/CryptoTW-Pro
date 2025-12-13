'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BrainCircuit, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketReport {
    id: string
    created_at: string
    sentiment: 'Bullish' | 'Bearish' | 'Neutral'
    sentiment_score: number
    summary: string
    key_points: string[]
    strategy: string
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
        return <Skeleton className="w-full h-32 rounded-xl bg-neutral-900 border border-white/5" />
    }

    if (!report) return null

    // Determine color based on sentiment
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment?.toLowerCase()) {
            case 'bullish': return 'text-green-400 border-green-500/30 bg-green-500/10'
            case 'bearish': return 'text-red-400 border-red-500/30 bg-red-500/10'
            default: return 'text-neutral-400 border-neutral-500/30 bg-neutral-500/10'
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 60) return 'bg-green-500'
        if (score <= 40) return 'bg-red-500'
        return 'bg-yellow-500'
    }

    return (
        <Card className="bg-neutral-900/50 border-white/5 overflow-hidden">
            {/* Header / Summary */}
            <div className="p-4 relative">
                {/* Background Glow */}
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full pointer-events-none",
                    getScoreColor(report.sentiment_score)
                )} />

                <div className="flex items-start gap-4">
                    {/* Icon & Score */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <BrainCircuit className="w-5 h-5 text-purple-400 z-10" />
                            <div className="absolute inset-0 bg-purple-500/20 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1",
                            getSentimentColor(report.sentiment)
                        )}>
                            {report.sentiment_score}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                AI 市場脈動
                                <span className="text-[10px] font-normal text-neutral-500 border-l border-white/10 pl-2">
                                    {new Date(report.created_at).toLocaleString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 更新
                                </span>
                            </h3>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                            >
                                {expanded ? '收起' : '完整報告'}
                                <ChevronRight className={cn("w-3 h-3 transition-transform", expanded ? "-rotate-90" : "rotate-90")} />
                            </button>
                        </div>

                        <p className={cn("text-xs text-neutral-300 leading-relaxed font-light", !expanded && "line-clamp-2")}>
                            {report.summary}
                        </p>

                        {/* Expanded Content */}
                        {expanded && (
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                {/* Key Points */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">關鍵因子</h4>
                                    <ul className="space-y-1">
                                        {report.key_points?.map((point, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actionable Strategy */}
                                <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-3">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        操作建議 (保守)
                                    </h4>
                                    <p className="text-xs text-blue-100/80 leading-relaxed">
                                        {report.strategy}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}
