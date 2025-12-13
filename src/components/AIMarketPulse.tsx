'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, ChevronDown, Bitcoin, Users, AlertTriangle, TrendingUp, Wallet, Target } from 'lucide-react'
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

    // Legacy fields
    one_liner?: string
    summary?: string
    sections?: any
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

    const sentimentColor =
        report.sentiment === '偏多' ? 'text-green-400' :
            report.sentiment === '偏空' ? 'text-red-400' :
                'text-blue-400'

    const sentimentBg =
        report.sentiment === '偏多' ? 'bg-green-500/10 border-green-500/20' :
            report.sentiment === '偏空' ? 'bg-red-500/10 border-red-500/20' :
                'bg-blue-500/10 border-blue-500/20'

    const displayHeadline = report.headline || report.one_liner || report.summary

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
            {/* Header */}
            <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                            {report.emoji ? (
                                <span className="text-base leading-none">{report.emoji}</span>
                            ) : (
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            )}
                        </div>
                        <span className="text-xs font-bold text-white">AI 交易分析</span>
                        {report.sentiment_score && (
                            <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5", sentimentColor)}>
                                {report.sentiment_score}/100
                            </div>
                        )}
                        {report.sentiment && (
                            <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", sentimentBg, sentimentColor)}>
                                {report.sentiment}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono">
                            {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-500 transition-transform", expanded && "rotate-180")} />
                    </div>
                </div>
                <p className={cn("text-sm text-neutral-200 leading-relaxed font-medium pl-7", !expanded && "line-clamp-2")}>
                    {displayHeadline}
                </p>
            </div>

            {/* Expanded: 5 Dimension Analysis */}
            {expanded && report.analysis && (
                <div className="px-3 pb-3 pl-7 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Price Momentum */}
                    {report.analysis.price_momentum && (
                        <div className="flex items-start gap-2.5 p-2 bg-orange-500/5 rounded-lg border border-orange-500/10">
                            <Bitcoin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-orange-400 font-bold">價格動能</span>
                                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                                        report.analysis.price_momentum.signal === '多頭' ? 'bg-green-500/20 text-green-400' :
                                            report.analysis.price_momentum.signal === '空頭' ? 'bg-red-500/20 text-red-400' :
                                                'bg-neutral-500/20 text-neutral-400'
                                    )}>{report.analysis.price_momentum.signal}</span>
                                </div>
                                <span className="text-xs text-neutral-300">{report.analysis.price_momentum.summary}</span>
                            </div>
                        </div>
                    )}

                    {/* Capital Flow */}
                    {report.analysis.capital_flow && (
                        <div className="flex items-start gap-2.5 p-2 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                            <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-[10px] text-cyan-400 font-bold block">資金熱度</span>
                                <span className="text-xs text-neutral-300">{report.analysis.capital_flow.summary}</span>
                                <span className="text-[10px] text-neutral-500 block mt-0.5">→ {report.analysis.capital_flow.interpretation}</span>
                            </div>
                        </div>
                    )}

                    {/* Whale Activity */}
                    {report.analysis.whale_activity && (
                        <div className="flex items-start gap-2.5 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10">
                            <span className="text-sm mt-0.5">🐋</span>
                            <div>
                                <span className="text-[10px] text-purple-400 font-bold block">大戶動向</span>
                                <span className="text-xs text-neutral-300">{report.analysis.whale_activity.summary}</span>
                                <span className="text-[10px] text-neutral-500 block mt-0.5">→ {report.analysis.whale_activity.interpretation}</span>
                            </div>
                        </div>
                    )}

                    {/* Retail Sentiment */}
                    {report.analysis.retail_sentiment && (
                        <div className="flex items-start gap-2.5 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                            <Users className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-[10px] text-blue-400 font-bold block">散戶情緒</span>
                                <span className="text-xs text-neutral-300">{report.analysis.retail_sentiment.summary}</span>
                                <span className="text-[10px] text-neutral-500 block mt-0.5">→ {report.analysis.retail_sentiment.interpretation}</span>
                            </div>
                        </div>
                    )}

                    {/* Risk Zones */}
                    {report.analysis.risk_zones && (
                        <div className="flex items-start gap-2.5 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-[10px] text-red-400 font-bold block">風險區域</span>
                                <span className="text-xs text-neutral-300">{report.analysis.risk_zones.summary}</span>
                                <span className="text-[10px] text-neutral-500 block mt-0.5">→ {report.analysis.risk_zones.interpretation}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Suggestion */}
                    {report.action_suggestion && (
                        <div className={cn("p-3 rounded-lg border mt-2", sentimentBg)}>
                            <div className="flex items-center gap-2 mb-2">
                                <Target className={cn("w-4 h-4", sentimentColor)} />
                                <span className={cn("text-xs font-bold", sentimentColor)}>操作建議</span>
                                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10", sentimentColor)}>
                                    {report.action_suggestion.bias}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-black/20 rounded p-1.5">
                                    <span className="text-[9px] text-neutral-500 block">進場區</span>
                                    <span className="text-[10px] text-green-400 font-mono">{report.action_suggestion.entry_zone}</span>
                                </div>
                                <div className="bg-black/20 rounded p-1.5">
                                    <span className="text-[9px] text-neutral-500 block">止損</span>
                                    <span className="text-[10px] text-red-400 font-mono">{report.action_suggestion.stop_loss_zone}</span>
                                </div>
                                <div className="bg-black/20 rounded p-1.5">
                                    <span className="text-[9px] text-neutral-500 block">止盈</span>
                                    <span className="text-[10px] text-blue-400 font-mono">{report.action_suggestion.take_profit_zone}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-2 flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                                {report.action_suggestion.risk_note}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


