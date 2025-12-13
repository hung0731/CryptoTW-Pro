'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketReport {
    id: string
    created_at: string
    emoji?: string
    sentiment?: string
    sentiment_score?: number
    headline?: string
    summary?: string
    metadata?: {
        analysis?: string
        action?: {
            bias: string
            entry_zone: string
            stop_loss: string
            take_profit: string
        }
        risk_note?: string
        headline?: string
    }
}

export function AIMarketPulse() {
    const [report, setReport] = useState<MarketReport | null>(null)
    const [loading, setLoading] = useState(true)

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
        return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!report) return null

    const sentimentColor =
        report.sentiment === '偏多' ? 'text-green-400' :
            report.sentiment === '偏空' ? 'text-red-400' : 'text-yellow-400'

    const sentimentBg =
        report.sentiment === '偏多' ? 'bg-green-500/10 border-green-500/20' :
            report.sentiment === '偏空' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'

    const displayHeadline = report.headline || report.metadata?.headline || report.summary
    const analysisText = report.metadata?.analysis
    const action = report.metadata?.action
    const riskNote = report.metadata?.risk_note

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">AI 市場日報</span>
                </div>
                <div className="flex items-center gap-3">
                    {report.emoji && <span className="text-2xl">{report.emoji}</span>}
                    {report.sentiment_score && (
                        <span className={cn("text-2xl font-bold font-mono", sentimentColor)}>
                            {report.sentiment_score}
                        </span>
                    )}
                    {report.sentiment && (
                        <span className={cn("text-xs px-2.5 py-1 rounded-full border", sentimentBg, sentimentColor)}>
                            {report.sentiment}
                        </span>
                    )}
                </div>
            </div>

            {/* Headline */}
            {displayHeadline && (
                <h2 className="text-lg text-white font-medium leading-relaxed">{displayHeadline}</h2>
            )}

            {/* Analysis Paragraph */}
            {analysisText && (
                <div className="bg-neutral-900/50 rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-neutral-300 leading-relaxed">{analysisText}</p>
                </div>
            )}

            {/* Action Suggestion */}
            {action && (
                <div className={cn("rounded-lg p-4 border", sentimentBg)}>
                    <div className="flex items-center gap-2 mb-4">
                        <Target className={cn("w-4 h-4", sentimentColor)} />
                        <span className={cn("text-sm font-medium", sentimentColor)}>操作參考</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded bg-white/10", sentimentColor)}>
                            {action.bias}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-black/30 rounded-lg p-3">
                            <span className="text-[10px] text-neutral-500 block mb-1">進場區</span>
                            <span className="text-base text-green-400 font-mono font-bold">{action.entry_zone}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <span className="text-[10px] text-neutral-500 block mb-1">止損</span>
                            <span className="text-base text-red-400 font-mono font-bold">{action.stop_loss}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <span className="text-[10px] text-neutral-500 block mb-1">目標</span>
                            <span className="text-base text-neutral-300 font-mono font-bold">{action.take_profit}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Note */}
            {riskNote && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                    <p className="text-sm text-amber-200/80">⚠️ {riskNote}</p>
                </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-neutral-600 text-right pt-2 border-t border-white/5">
                更新於 {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    )
}


