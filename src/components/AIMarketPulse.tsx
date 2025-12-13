'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'
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
        whale_summary?: string
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

    const score = report.sentiment_score || 50
    const displayHeadline = report.headline || report.metadata?.headline || report.summary
    const analysisText = report.metadata?.analysis
    const whaleSummary = report.metadata?.whale_summary
    const action = report.metadata?.action
    const riskNote = report.metadata?.risk_note

    // Simplified color scheme - only use accent for key data
    const sentimentLabel = report.sentiment === '偏多' ? '偏多' :
        report.sentiment === '偏空' ? '偏空' : '震盪'

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">AI 市場解讀</span>
                </div>
                {report.emoji && <span className="text-lg opacity-80">{report.emoji}</span>}
            </div>

            {/* Headline */}
            {displayHeadline && (
                <h3 className="text-base font-bold text-white leading-snug">{displayHeadline}</h3>
            )}

            {/* Analysis */}
            {analysisText && (
                <div className="text-xs text-neutral-400 leading-relaxed space-y-2">
                    <p>{analysisText}</p>
                </div>
            )}

            {/* Action Plan */}
            {action && (
                <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                        <span className="text-xs text-neutral-400">操作策略</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${action.bias === '偏多' ? 'bg-green-500/10 text-green-400' :
                                action.bias === '偏空' ? 'bg-red-500/10 text-red-400' :
                                    'bg-neutral-700 text-neutral-300'
                            }`}>{action.bias}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <span className="text-[10px] text-neutral-500 block mb-1">進場區</span>
                            <span className="text-xs text-white font-mono block">{action.entry_zone}</span>
                        </div>
                        <div className="relative">
                            <span className="text-[10px] text-neutral-500 block mb-1">止損</span>
                            <span className="text-xs text-red-400 font-mono block">{action.stop_loss}</span>
                            {/* Divider lines */}
                            <div className="absolute top-2 left-0 w-px h-6 bg-white/5"></div>
                            <div className="absolute top-2 right-0 w-px h-6 bg-white/5"></div>
                        </div>
                        <div>
                            <span className="text-[10px] text-neutral-500 block mb-1">目標</span>
                            <span className="text-xs text-green-400 font-mono block">{action.take_profit}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Note & Footer */}
            <div className="pt-3 border-t border-white/5 space-y-2">
                {riskNote && (
                    <div className="flex items-start gap-2">
                        <span className="text-[10px] text-orange-400 shrink-0 mt-0.5">⚠️ 風險</span>
                        <p className="text-[10px] text-neutral-500 leading-tight">{riskNote}</p>
                    </div>
                )}

                <div className="text-[9px] text-neutral-600 text-right">
                    更新於 {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>

    )
}
