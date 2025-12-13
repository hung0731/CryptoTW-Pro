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
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">AI 市場日報</span>
                </div>
                <div className="flex items-center gap-2">
                    {report.emoji && <span className="text-lg text-neutral-400">{report.emoji}</span>}
                    <span className="text-xs text-neutral-500 px-2 py-0.5 rounded-full bg-neutral-800">
                        {sentimentLabel}
                    </span>
                </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">情緒指數</span>
                    <span className="text-white font-mono">{score}/100</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white/60 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-600">
                    <span>極度恐懼</span>
                    <span>中性</span>
                    <span>極度貪婪</span>
                </div>
            </div>

            {/* Headline */}
            {displayHeadline && (
                <p className="text-sm text-white leading-relaxed">{displayHeadline}</p>
            )}

            {/* Analysis */}
            {analysisText && (
                <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-neutral-400 leading-relaxed">{analysisText}</p>
                </div>
            )}

            {/* Whale Summary */}
            {whaleSummary && (
                <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-neutral-400">巨鯨動態：{whaleSummary}</p>
                </div>
            )}

            {/* Action */}
            {action && (
                <div className="bg-neutral-900 rounded-lg p-3 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">操作參考</span>
                        <span className="text-xs text-white px-2 py-0.5 rounded bg-neutral-800">{action.bias}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <span className="text-[10px] text-neutral-600 block">進場區</span>
                            <span className="text-xs text-white font-mono">{action.entry_zone}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-neutral-600 block">止損</span>
                            <span className="text-xs text-white font-mono">{action.stop_loss}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-neutral-600 block">目標</span>
                            <span className="text-xs text-white font-mono">{action.take_profit}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Note */}
            {riskNote && (
                <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-neutral-500">風險提示：{riskNote}</p>
                </div>
            )}

            {/* Footer */}
            <div className="text-[10px] text-neutral-600 text-right pt-2 border-t border-white/5">
                更新於 {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    )
}
