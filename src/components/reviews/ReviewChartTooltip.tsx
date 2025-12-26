import React from 'react'
import { CHART, COLORS } from '@/lib/design-tokens'
import { formatPercent, formatPrice, formatSmallPercent, formatRatio } from '@/lib/format-helpers'
import { getChartSemanticModel, getSemanticColor, mapReviewTypeToSemanticId } from '@/lib/chart-semantics'

interface ReviewChartTooltipProps {
    active?: boolean
    payload?: any[]
    label?: string
    type: string
    isPercentage: boolean
    overlayType?: 'oi' | 'funding'
}

export const ReviewChartTooltip: React.FC<ReviewChartTooltipProps> = ({ active, payload, label, type, isPercentage, overlayType }) => {
    if (active && payload && payload.length) {
        const val = Number(payload[0].value)
        const semanticId = mapReviewTypeToSemanticId(type)
        const model = semanticId ? getChartSemanticModel(semanticId) : null
        const explanation = model ? model.getTooltipExplanation(val) : ''

        return (
            <div className="bg-[#0F0F10]/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl min-w-[140px]">
                <p className={CHART.tooltip.date}>{label}</p>
                <div className=" space-y-1">
                    <p className={CHART.tooltip.value}>
                        {type === 'price' && (
                            isPercentage
                                ? <span className={payload[0].payload.percentage >= 0 ? COLORS.positive : COLORS.negative}>
                                    {formatPercent(payload[0].payload.percentage)}
                                </span>
                                : formatPrice(val)
                        )}
                        {type === 'supply' && `${val.toLocaleString()}`}

                        {model && (
                            <>
                                <span style={{ color: getSemanticColor(val, model) }}>
                                    {type === 'funding' || type === 'premium' ? formatSmallPercent(val) :
                                        type === 'fgi' ? val.toFixed(0) :
                                            type === 'longShort' ? formatRatio(val) :
                                                type === 'basis' ? `${val.toFixed(2)}%` :
                                                    type === 'basis' ? `${val.toFixed(2)}%` :
                                                        type === 'flow' || type === 'liquidation' ? (Math.abs(val) > 1000000000 ? `$${(val / 1000000000).toFixed(2)}B` : `$${(val / 1000000).toFixed(2)}M`) :
                                                            type === 'stablecoin' ? `$${(val / 1000000000).toFixed(2)}B` :
                                                                val}
                                </span>
                                {explanation && (
                                    <span className="block text-[10px] text-neutral-500 mt-0.5">
                                        {explanation}
                                    </span>
                                )}
                            </>
                        )}

                        {/* Specific fix for OI percentage display which is special in ReviewChart */}
                        {type === 'oi' && (
                            <span className={payload[0].payload.percentage >= 0 ? COLORS.positive : COLORS.negative}>
                                {formatPercent(payload[0].payload.percentage)}
                            </span>
                        )}
                    </p>

                    {/* Overlay Data */}
                    {overlayType && payload[0].payload[`overlay_${overlayType}`] !== undefined && (
                        <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                            <span className="text-amber-500 font-medium">
                                {overlayType === 'oi' ? '持倉量' : '資金費率'}
                            </span>
                            <span className="text-neutral-200 tabular-nums">
                                {overlayType === 'oi'
                                    ? `$${(payload[0].payload[`overlay_${overlayType}`] / 1000000000).toFixed(2)}B`
                                    : formatSmallPercent(payload[0].payload[`overlay_${overlayType}`])
                                }
                            </span>
                        </div>
                    )}
                </div>
                {isPercentage && type === 'price' && (
                    <p className="text-neutral-500 text-[10px] mt-1">
                        {formatPrice(Number(payload[0].payload.price))}
                    </p>
                )}
            </div>
        )
    }
    return null
}
