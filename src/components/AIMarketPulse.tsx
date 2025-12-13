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

    analysis?: {
        price_momentum?: { summary: string; signal: string }
        capital_flow?: { summary: string; interpretation: string }
        whale_activity?: { summary: string; interpretation: string }
        retail_sentiment?: { summary: string; interpretation: string }
        risk_zones?: { summary: string; interpretation: string }
    }

    action_suggestion?: {
        bias: string
        entry_zone: string
        stop_loss_zone: string
        take_profit_zone: string
        risk_note: string
    }

    summary?: string
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
        return <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!report) return null

    const sentimentColor =
        report.sentiment === '偏多' ? 'text-green-400' :
            report.sentiment === '偏空' ? 'text-red-400' : 'text-neutral-400'

    const displayHeadline = report.headline || report.summary

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">AI 交易分析</span>
                </div>
                <div className="flex items-center gap-2">
                    {report.emoji && (
                        <span className="text-lg">{report.emoji}</span>
                    )}
                    {report.sentiment_score && (
                        <span className={cn("text-lg font-bold font-mono", sentimentColor)}>
                            {report.sentiment_score}
                        </span>
                    )}
                    {report.sentiment && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full bg-white/5", sentimentColor)}>
                            {report.sentiment}
                        </span>
                    )}
                </div>
            </div>

            {/* Headline */}
            {displayHeadline && (
                <p className="text-sm text-white font-medium">{displayHeadline}</p>
            )}

            {/* Analysis Grid */}
            {report.analysis && (
                <div className="grid grid-cols-2 gap-2">
                    {report.analysis.price_momentum && (
                        <div className="bg-neutral-900 rounded-lg p-2.5 border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-neutral-500">價格</span>
                                <span className={cn("text-[10px] font-medium",
                                    report.analysis.price_momentum.signal === '多頭' ? 'text-green-400' :
                                        report.analysis.price_momentum.signal === '空頭' ? 'text-red-400' : 'text-neutral-400'
                                )}>{report.analysis.price_momentum.signal}</span>
                            </div>
                            <span className="text-xs text-neutral-300">{report.analysis.price_momentum.summary}</span>
                        </div>
                    )}
                    {report.analysis.capital_flow && (
                        <div className="bg-neutral-900 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-neutral-500 block mb-1">資金</span>
                            <span className="text-xs text-neutral-300">{report.analysis.capital_flow.summary}</span>
                        </div>
                    )}
                    {report.analysis.whale_activity && (
                        <div className="bg-neutral-900 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-neutral-500 block mb-1">🐋 大戶</span>
                            <span className="text-xs text-neutral-300">{report.analysis.whale_activity.summary}</span>
                        </div>
                    )}
                    {report.analysis.retail_sentiment && (
                        <div className="bg-neutral-900 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-neutral-500 block mb-1">散戶</span>
                            <span className="text-xs text-neutral-300">{report.analysis.retail_sentiment.summary}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Risk Warning */}
            {report.analysis?.risk_zones && (
                <div className="text-xs text-neutral-500">
                    ⚠️ {report.analysis.risk_zones.summary} — {report.analysis.risk_zones.interpretation}
                </div>
            )}

            {/* Action Suggestion */}
            {report.action_suggestion && (
                <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-xs text-neutral-400">操作建議</span>
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded bg-white/5", sentimentColor)}>
                            {report.action_suggestion.bias}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        <div>
                            <span className="text-[9px] text-neutral-600 block">進場</span>
                            <span className="text-[11px] text-green-400 font-mono">{report.action_suggestion.entry_zone}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-neutral-600 block">止損</span>
                            <span className="text-[11px] text-red-400 font-mono">{report.action_suggestion.stop_loss_zone}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-neutral-600 block">止盈</span>
                            <span className="text-[11px] text-neutral-300 font-mono">{report.action_suggestion.take_profit_zone}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-neutral-500">💡 {report.action_suggestion.risk_note}</p>
                </div>
            )}

            {/* Timestamp */}
            <div className="text-[10px] text-neutral-600 text-right">
                更新於 {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    )
}
