'use client'

import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CARDS } from '@/lib/design-tokens'

interface AIMarketPulseProps {
    report: any // Using specific type would be better but keeping flexible for now
}

export function AIMarketPulse({ report }: AIMarketPulseProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    if (!report) return null

    const displayHeadline = report.headline || report.metadata?.headline || report.summary
    const analysisText = report.metadata?.analysis || report.analysis
    const structure = report.metadata?.market_structure || report.market_structure
    const riskNote = report.metadata?.risk_note || report.risk_note

    return (
        <div className={cn(CARDS.primary, "overflow-hidden")}>
            {/* Display Layer (Always Visible) */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0E0E0F]"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">AI 市場懶人包</span>
                    </div>
                    {/* One-line Summary */}
                    <div className="h-4 w-px bg-white/10 shrink-0"></div>
                    <p className="text-xs text-neutral-300 truncate font-medium">
                        {displayHeadline}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    {report.emoji && <span className="text-lg opacity-80">{report.emoji}</span>}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </div>
            </div>

            {/* Detail Layer (Expandable) */}
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 space-y-4">

                    {/* Analysis */}
                    {analysisText && (
                        <div className="text-xs text-neutral-400 leading-relaxed space-y-2 border-t border-white/5 pt-3">
                            <p>{analysisText}</p>
                        </div>
                    )}

                    {/* Market Structure */}
                    {structure && (
                        <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                <div className="flex items-center">
                                    <span className="text-xs text-neutral-400">市場結構參考</span>
                                    <ExplainTooltip
                                        term="市場結構 (Market Structure)"
                                        definition="基於流動性分布與支撐壓力位所繪製的戰術地圖。"
                                        explanation={
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>關注區</strong>：價格最可能發生反應（反彈或跌破）的關鍵位置。</li>
                                                <li><strong>結構失效</strong>：若價格收盤突破此區，代表原先趨勢改變，應立即止損重新評估。</li>
                                                <li><strong>壓力區</strong>：上方賣壓較重的區域，適合分批獲利了結。</li>
                                            </ul>
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <span className="text-[10px] text-neutral-500 block mb-1">市場關注區</span>
                                    <span className="text-xs text-neutral-200 font-mono block">
                                        {structure.focus_zone}
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="text-[10px] text-neutral-500 block mb-1">結構失效區</span>
                                    <span className="text-xs text-orange-300 font-mono block">
                                        {structure.invalidation_zone}
                                    </span>
                                    {/* Divider lines */}
                                    <div className="absolute top-2 left-0 w-px h-6 bg-white/5"></div>
                                    <div className="absolute top-2 right-0 w-px h-6 bg-white/5"></div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-500 block mb-1">潛在壓力區</span>
                                    <span className="text-xs text-neutral-200 font-mono block">
                                        {structure.resistance_zone}
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
                    <div className="pt-1 space-y-2">
                        {riskNote && (
                            <div className="flex items-start gap-2 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                                <span className="text-[10px] text-orange-400 shrink-0 mt-0.5">⚠️ 風險提示</span>
                                <p className="text-[10px] text-neutral-400 leading-tight">{riskNote}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
