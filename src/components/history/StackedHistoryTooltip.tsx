import React from 'react'
import { AlertCircle } from 'lucide-react'
import { CHART } from '@/lib/design-tokens'
import { formatPercent } from '@/lib/format-helpers'

interface StackedHistoryTooltipProps {
    active?: boolean
    payload?: any[]
    label?: number
    viewType: 'pct' | 'dd' | 'impact'
}

export const StackedHistoryTooltip: React.FC<StackedHistoryTooltipProps> = ({ active, payload, label, viewType }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`${CHART.tooltip.container} min-w-[240px] backdrop-blur-md`}>
                <p className="text-[#808080] mb-2 font-mono flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
                    <span className="text-white font-bold">D{label! >= 0 ? `+${label}` : label}</span>
                    <span>(事件日)</span>
                </p>
                {payload.map((p: any, i: number) => {
                    // Determine which real value to pick based on viewType
                    let realKey: string
                    if (viewType === 'pct') {
                        realKey = p.dataKey === 'leftPctDisplay' ? 'leftPct' : 'rightPct'
                    } else if (viewType === 'impact') {
                        realKey = p.dataKey === 'leftImpactDisplay' ? 'leftPct' : 'rightPct' // Impact view shows PCT value but normalized graph
                    } else { // dd
                        realKey = p.dataKey === 'leftDDDisplay' ? 'leftDD' : 'rightDD'
                    }

                    // We access the real value from payload[0].payload (the full data object)
                    const realVal = p.payload[realKey]
                    const isClamped = realVal !== p.value && viewType !== 'impact' // p.value is the clamped display value, impact is normalized

                    // Context logic
                    let context = ''
                    if (realVal !== null) {
                        if (realVal < -20) context = '恐慌加劇'
                        else if (realVal < -10) context = '信心脆弱'
                        else if (realVal > 10) context = '反彈強勁'
                        else context = '盤整中'
                    }

                    return (
                        <div key={i} className="mb-3 last:mb-0">
                            <div className="flex items-center justify-between gap-4 mb-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span className="text-neutral-300 font-medium">
                                        {p.name.includes('基準') ? '基準' : '對照'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`font-mono font-bold text-sm ${realVal !== null && realVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {realVal !== null ? formatPercent(Number(realVal)) : '—'}
                                    </span>
                                </div>
                            </div>

                            {/* Warning if Clamped */}
                            {isClamped && (
                                <div className="flex items-center justify-end gap-1 mb-1 text-amber-500">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-[10px]">極端值已截斷 ({formatPercent(p.value)})</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }
    return null
}
