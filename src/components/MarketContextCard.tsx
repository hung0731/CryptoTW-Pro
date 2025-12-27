'use client'

import { Link as LinkIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { Badge } from '@/components/ui/badge'
import { MarketContext } from '@/lib/types'

interface MarketContextCardProps {
    context?: MarketContext
    updatedAt?: string
}

export function MarketContextCard({ context, updatedAt }: MarketContextCardProps) {
    if (!context) return null

    return (
        <div className="bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-sm font-medium text-white">今日市場脈絡</span>
                    <ExplainTooltip
                        term="市場脈絡 (Market Context)"
                        definition="AI 彙整過去 24 小時市場關注的「主題」與「影響層面」。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>去雜訊</strong>：不看新聞細節，只看市場正在煩惱什麼。</li>
                                <li><strong>關注主題</strong>：歸納宏觀、監管或資金流向的大趨勢。</li>
                                <li><strong>影響層面</strong>：分析此主題對市場情緒或資金的潛在影響。</li>
                            </ul>
                        }
                    />
                </div>
                {updatedAt && (
                    <span className="text-xs text-neutral-500">
                        {new Date(updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>

            {/* AI Summary */}
            <div className="text-sm font-medium text-white leading-relaxed">
                {context.summary}
            </div>

            {/* Highlights List */}
            <div className="space-y-3">
                {context.highlights?.map((item, i) => (
                    <div key={i} className="bg-black/20 rounded-lg p-3 border border-[#1A1A1A] hover:border-[#2A2A2A]">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mt-0.5">
                                <span className="text-xs font-bold text-[#8B5CF6]">{i + 1}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-neutral-200 font-medium">
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-neutral-500">影響層面：</span>
                                    <Badge variant="outline" className="border-white/10 text-neutral-400 text-[10px] h-5 px-1.5 font-normal">
                                        {item.impact}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legal / Context Disclaimer */}
            <div className="pt-2">
                <p className="text-[10px] text-neutral-600 text-center">
                    本區內容為市場脈絡整理，僅供研究與理解市場使用。
                </p>
            </div>

            {/* Recommendations Section (Rich Cards) */}
            {context.recommended_readings && context.recommended_readings.length > 0 && (
                <div className="border-t border-[#1A1A1A] bg-black/20 -mx-5 -mb-5 p-4 rounded-b-xl">
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-bold text-[#8B5CF6]/70 tracking-wider">
                            💡 推薦閱讀
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {context.recommended_readings.map((rec, idx) => (
                                <Link
                                    key={idx}
                                    href={rec.path}
                                    className="group relative flex items-start gap-3 p-3 rounded-lg bg-[#0E0E0F] border border-[#1A1A1A] hover:bg-[#141414] hover:border-[#8B5CF6]/30 transition-all duration-300"
                                >
                                    {/* Icon Box */}
                                    <div className="shrink-0 w-8 h-8 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:bg-[#8B5CF6]/10 group-hover:border-[#8B5CF6]/20 transition-colors">
                                        <LinkIcon className="w-4 h-4 text-neutral-400 group-hover:text-[#8B5CF6] transition-colors" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors truncate">
                                            {rec.title}
                                        </h4>
                                        <p className="text-[10px] text-neutral-500 mt-0.5 truncate group-hover:text-neutral-400 transition-colors">
                                            點擊查看詳解
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}
