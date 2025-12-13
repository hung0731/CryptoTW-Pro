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
        market_structure?: {
            bias: string
            focus_zone: string
            invalidation_zone: string
            resistance_zone: string
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
    const structure = report.metadata?.market_structure
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

            {/* Market Structure (New) or Action Plan (Legacy Fallback) */}
            {(structure || action) && (
                <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                        <span className="text-xs text-neutral-400">市場結構參考</span>
                        {/* Remove bias display to be neutral, or keep it subtle */}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <span className="text-[10px] text-neutral-500 block mb-1">市場關注區</span>
                            <span className="text-xs text-neutral-200 font-mono block">
                                {structure?.focus_zone || action?.entry_zone}
                            </span>
                        </div>
                        <div className="relative">
                            <span className="text-[10px] text-neutral-500 block mb-1">結構失效區</span>
                            <span className="text-xs text-orange-300 font-mono block">
                                {structure?.invalidation_zone || action?.stop_loss}
                            </span>
                            {/* Divider lines */}
                            <div className="absolute top-2 left-0 w-px h-6 bg-white/5"></div>
                            <div className="absolute top-2 right-0 w-px h-6 bg-white/5"></div>
                        </div>
                        <div>
                            <span className="text-[10px] text-neutral-500 block mb-1">潛在壓力區</span>
                            <span className="text-xs text-neutral-200 font-mono block">
                                {structure?.resistance_zone || action?.take_profit}
                            </span>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="pt-1">
                        <p className="text-[9px] text-neutral-600 text-center transform scale-90">
                            *僅為市場結構與流動性分布參考，非交易建議
                        </p>
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
