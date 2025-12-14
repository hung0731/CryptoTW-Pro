'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp, TrendingDown, Minus, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface AIDecisionData {
    conclusion: string       // "震盪偏空｜短線風險上升"
    bias: '偏多' | '偏空' | '震盪' | '中性'
    risk_level: '低' | '中' | '中高' | '高'
    action: string           // "降低槓桿 / 等待確認"
    reasoning: string        // 展開後的詳細分析
    tags?: {
        btc: string
        alt: string
        sentiment: string
    }
}

interface AIDecisionCardProps {
    data: AIDecisionData | null
    isLoading?: boolean
}

const RiskConfig = {
    '高': { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', icon: '🔴' },
    '中高': { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', icon: '🟠' },
    '中': { color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', icon: '🟡' },
    '低': { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30', icon: '🟢' },
}

const BiasConfig = {
    '偏多': { color: 'text-green-400', bg: 'bg-green-500/20', icon: <TrendingUp className="w-4 h-4" /> },
    '偏空': { color: 'text-red-400', bg: 'bg-red-500/20', icon: <TrendingDown className="w-4 h-4" /> },
    '震盪': { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: <Minus className="w-4 h-4" /> },
    '中性': { color: 'text-neutral-400', bg: 'bg-neutral-500/20', icon: <Minus className="w-4 h-4" /> },
}

function AIDecisionSkeleton() {
    return (
        <div className="rounded-2xl p-5 bg-neutral-900/50 border border-white/5 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
                <Skeleton className="h-4 w-32 bg-neutral-700" />
            </div>
            <Skeleton className="h-7 w-3/4 bg-neutral-700 mb-4" />
            <div className="flex gap-3 mb-4">
                <Skeleton className="h-8 w-28 bg-neutral-700 rounded-lg" />
                <Skeleton className="h-8 w-40 bg-neutral-700 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-20 bg-neutral-700" />
        </div>
    )
}

export function AIDecisionCard({ data, isLoading }: AIDecisionCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (isLoading) return <AIDecisionSkeleton />
    if (!data) return null

    const riskStyle = RiskConfig[data.risk_level] || RiskConfig['中']
    const biasStyle = BiasConfig[data.bias] || BiasConfig['中性']

    return (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-white/5 rounded-xl p-4 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧠</span>
                <span className="text-sm font-bold text-blue-200 tracking-wider">AI 速覽</span>
            </div>

            {/* Main Conclusion */}
            <h1 className="text-base font-bold text-white mb-3 leading-snug">
                {data.conclusion}
            </h1>

            {/* Status Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
                {/* Bias Tag */}
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-xs",
                    biasStyle.bg, biasStyle.color
                )}>
                    {biasStyle.icon}
                    <span>{data.bias}</span>
                </div>

                {/* Risk Level */}
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs",
                    "bg-neutral-800/50 border border-white/10"
                )}>
                    <span>{riskStyle.icon}</span>
                    <span className="text-neutral-400">風險等級：</span>
                    <span className={riskStyle.color}>{data.risk_level}</span>
                </div>
            </div>

            {/* Action Recommendation */}
            <div className="bg-neutral-900/50 rounded-lg p-3 mb-3 border border-white/5">
                <div className="flex items-start gap-2">
                    <span className="text-sm">🧭</span>
                    <div>
                        <span className="text-[10px] text-neutral-500 block mb-0.5">建議做法</span>
                        <span className="text-xs text-white font-medium">{data.action}</span>
                    </div>
                </div>
            </div>

            {/* Mini Tags (if available) */}
            {data.tags && (
                <div className="flex items-center gap-3 mb-3 text-[10px]">
                    <div className="flex items-center gap-1">
                        <span className="text-neutral-500">BTC:</span>
                        <span className="text-neutral-300">{data.tags.btc}</span>
                    </div>
                    <div className="w-px h-2.5 bg-white/10" />
                    <div className="flex items-center gap-1">
                        <span className="text-neutral-500">Alt:</span>
                        <span className="text-neutral-300">{data.tags.alt}</span>
                    </div>
                    <div className="w-px h-2.5 bg-white/10" />
                    <div className="flex items-center gap-1">
                        <span className="text-neutral-500">情緒:</span>
                        <span className="text-neutral-300">{data.tags.sentiment}</span>
                    </div>
                </div>
            )}

            {/* Expand Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors w-full justify-center pt-2 border-t border-white/5"
            >
                {isExpanded ? '收起詳細分析' : '查看詳細分析'}
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Expanded Reasoning */}
            {isExpanded && (
                <div className="mt-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line bg-neutral-900/30 p-3 rounded-lg">
                        {data.reasoning}
                    </p>
                </div>
            )}

            {/* Branding Footer */}
            <div className="mt-4 border-t border-white/5 flex items-center justify-between text-[11px] bg-blue-950/20 -mx-4 -mb-4 px-4 py-2.5">
                <div className="flex items-center gap-2 text-neutral-400">
                    <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium">全局決策</span>
                </div>
                <span className="text-blue-300 font-bold tracking-wide">加密台灣 Pro</span>
            </div>
        </div>
    )
}
