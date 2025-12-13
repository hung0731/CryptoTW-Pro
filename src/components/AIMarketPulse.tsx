'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, Target, TrendingUp, TrendingDown } from 'lucide-react'
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
        return <Skeleton className="h-96 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!report) return null

    const sentimentColor =
        report.sentiment === '偏多' ? 'text-green-400' :
            report.sentiment === '偏空' ? 'text-red-400' : 'text-yellow-400'

    const sentimentBg =
        report.sentiment === '偏多' ? 'bg-green-500/10 border-green-500/20' :
            report.sentiment === '偏空' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'

    const displayHeadline = report.headline || report.summary

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">AI 交易分析</span>
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
                <p className="text-lg text-white font-medium leading-relaxed">{displayHeadline}</p>
            )}

            {/* Analysis Cards - Full Width */}
            {report.analysis && (
                <div className="space-y-3">
                    {/* Price Momentum */}
                    {report.analysis.price_momentum && (
                        <div className="bg-neutral-900 rounded-lg p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                                    {report.analysis.price_momentum.signal === '多頭' ?
                                        <TrendingUp className="w-3.5 h-3.5 text-green-400" /> :
                                        report.analysis.price_momentum.signal === '空頭' ?
                                            <TrendingDown className="w-3.5 h-3.5 text-red-400" /> :
                                            null
                                    }
                                    價格動能
                                </span>
                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded",
                                    report.analysis.price_momentum.signal === '多頭' ? 'bg-green-500/20 text-green-400' :
                                        report.analysis.price_momentum.signal === '空頭' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-500/20 text-neutral-400'
                                )}>{report.analysis.price_momentum.signal}</span>
                            </div>
                            <p className="text-sm text-neutral-200 leading-relaxed">{report.analysis.price_momentum.summary}</p>
                        </div>
                    )}

                    {/* Capital Flow + Whale - 2 columns */}
                    <div className="grid grid-cols-2 gap-3">
                        {report.analysis.capital_flow && (
                            <div className="bg-neutral-900 rounded-lg p-4 border border-white/5">
                                <span className="text-xs text-neutral-500 block mb-2">💰 資金熱度</span>
                                <p className="text-sm text-neutral-200 leading-relaxed">{report.analysis.capital_flow.summary}</p>
                                <p className="text-xs text-neutral-500 mt-2">→ {report.analysis.capital_flow.interpretation}</p>
                            </div>
                        )}
                        {report.analysis.whale_activity && (
                            <div className="bg-neutral-900 rounded-lg p-4 border border-white/5">
                                <span className="text-xs text-neutral-500 block mb-2">🐋 大戶動向</span>
                                <p className="text-sm text-neutral-200 leading-relaxed">{report.analysis.whale_activity.summary}</p>
                                <p className="text-xs text-neutral-500 mt-2">→ {report.analysis.whale_activity.interpretation}</p>
                            </div>
                        )}
                    </div>

                    {/* Retail Sentiment */}
                    {report.analysis.retail_sentiment && (
                        <div className="bg-neutral-900 rounded-lg p-4 border border-white/5">
                            <span className="text-xs text-neutral-500 block mb-2">👥 散戶情緒</span>
                            <p className="text-sm text-neutral-200 leading-relaxed">{report.analysis.retail_sentiment.summary}</p>
                            <p className="text-xs text-neutral-500 mt-2">→ {report.analysis.retail_sentiment.interpretation}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Risk Warning */}
            {report.analysis?.risk_zones && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                    <span className="text-xs text-red-400 block mb-2">⚠️ 風險提醒</span>
                    <p className="text-sm text-neutral-300">{report.analysis.risk_zones.summary}</p>
                    <p className="text-xs text-neutral-500 mt-2">→ {report.analysis.risk_zones.interpretation}</p>
                </div>
            )}

            {/* Action Suggestion */}
            {report.action_suggestion && (
                <div className={cn("rounded-lg p-4 border", sentimentBg)}>
                    <div className="flex items-center gap-2 mb-4">
                        <Target className={cn("w-4 h-4", sentimentColor)} />
                        <span className={cn("text-sm font-medium", sentimentColor)}>操作建議</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded bg-white/10", sentimentColor)}>
                            {report.action_suggestion.bias}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                        <div className="bg-black/30 rounded-lg p-3">
                            <span className="text-[10px] text-neutral-500 block mb-1">進場區</span>
                            <span className="text-base text-green-400 font-mono font-bold">{report.action_suggestion.entry_zone}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <span className="text-[10px] text-neutral-500 block mb-1">止損</span>
                            <span className="text-base text-red-400 font-mono font-bold">{report.action_suggestion.stop_loss_zone}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <span className="text-[10px] text-neutral-500 block mb-1">止盈</span>
                            <span className="text-base text-neutral-300 font-mono font-bold">{report.action_suggestion.take_profit_zone}</span>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-sm text-neutral-400">💡 {report.action_suggestion.risk_note}</p>
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-neutral-600 text-right pt-2 border-t border-white/5">
                AI 分析更新於 {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    )
}


