'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp, TrendingDown, Minus, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { CARDS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens'

interface AIDecisionData {
    conclusion: string
    bias: '偏多' | '偏空' | '震盪' | '中性'
    risk_level: '低' | '中' | '中高' | '高'
    action: string
    reasoning: string
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
    '高': { color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/15', border: 'border-[#EF4444]/30', icon: '🔴' },
    '中高': { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/15', border: 'border-[#F59E0B]/30', icon: '🟠' },
    '中': { color: 'text-[#EAB308]', bg: 'bg-[#EAB308]/15', border: 'border-[#EAB308]/30', icon: '🟡' },
    '低': { color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/15', border: 'border-[#22C55E]/30', icon: '🟢' },
}

const BiasConfig = {
    '偏多': { color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/20', icon: <TrendingUp className="w-4 h-4" /> },
    '偏空': { color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/20', icon: <TrendingDown className="w-4 h-4" /> },
    '震盪': { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/20', icon: <Minus className="w-4 h-4" /> },
    '中性': { color: 'text-[#808080]', bg: 'bg-[#808080]/20', icon: <Minus className="w-4 h-4" /> },
}

function AIDecisionSkeleton() {
    return (
        <div className={cn(CARDS.primary, SPACING.cardLarge)}>
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5 rounded bg-[#1A1A1A]" />
                <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            </div>
            <Skeleton className="h-7 w-3/4 bg-[#1A1A1A] mb-4" />
            <div className="flex gap-3 mb-4">
                <Skeleton className="h-8 w-28 bg-[#1A1A1A] rounded-lg" />
                <Skeleton className="h-8 w-40 bg-[#1A1A1A] rounded-lg" />
            </div>
            <Skeleton className="h-4 w-20 bg-[#1A1A1A]" />
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
        <div className={cn(CARDS.primary, SPACING.card)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧠</span>
                <span className={cn(TYPOGRAPHY.cardTitle, "text-[#3B82F6]")}>AI 速覽</span>
            </div>

            {/* Main Conclusion */}
            <h1 className={cn(TYPOGRAPHY.sectionTitle, "mb-3 leading-snug")}>
                {data.conclusion.replace(/｜/g, ' ')}
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs bg-[#1A1A1A] border border-[#2A2A2A]">
                    <span>{riskStyle.icon}</span>
                    <span className="text-[#808080]">風險等級：</span>
                    <span className={riskStyle.color}>{data.risk_level}</span>
                </div>
            </div>

            {/* Action Recommendation */}
            <div className={cn(CARDS.passive, SPACING.cardCompact, "mb-3")}>
                <div className="flex items-start gap-2">
                    <span className="text-sm">🧭</span>
                    <div>
                        <span className={cn(TYPOGRAPHY.caption, "block mb-0.5")}>建議做法</span>
                        <span className="text-xs text-white font-medium">{data.action}</span>
                    </div>
                </div>
            </div>

            {/* Mini Tags */}
            {data.tags && (
                <div className="flex items-center gap-3 mb-3 text-[10px]">
                    <div className="flex items-center gap-1">
                        <span className="text-[#666666]">BTC:</span>
                        <span className="text-[#A0A0A0]">{data.tags.btc}</span>
                    </div>
                    <div className="w-px h-2.5 bg-[#1A1A1A]" />
                    <div className="flex items-center gap-1">
                        <span className="text-[#666666]">Alt:</span>
                        <span className="text-[#A0A0A0]">{data.tags.alt}</span>
                    </div>
                    <div className="w-px h-2.5 bg-[#1A1A1A]" />
                    <div className="flex items-center gap-1">
                        <span className="text-[#666666]">情緒:</span>
                        <span className="text-[#A0A0A0]">{data.tags.sentiment}</span>
                    </div>
                </div>
            )}

            {/* Expand Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[10px] text-[#666666] hover:text-white w-full justify-center pt-2 border-t border-[#1A1A1A]"
            >
                {isExpanded ? '收起詳細分析' : '查看詳細分析'}
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Expanded Reasoning */}
            {isExpanded && (
                <div className="mt-3 pt-2">
                    <p className={cn(TYPOGRAPHY.bodyDefault, "whitespace-pre-line bg-[#080808] p-3 rounded-lg")}>
                        {data.reasoning}
                    </p>
                </div>
            )}

            {/* Branding Footer */}
            <div className="mt-4 border-t border-[#1A1A1A] flex items-center justify-between text-[11px] bg-[#0A1628] -mx-4 -mb-4 px-4 py-2.5">
                <div className="flex items-center gap-2 text-[#808080]">
                    <Newspaper className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span className="font-medium">全局決策</span>
                </div>
                <span className="text-[#60A5FA] font-bold tracking-wide">加密台灣 Pro</span>
            </div>
        </div>
    )
}

