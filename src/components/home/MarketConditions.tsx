'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MarketStatusData } from '@/lib/types'
import { Zap, Activity, AlertTriangle, Lock, Eye, ShieldCheck } from 'lucide-react'

interface MarketConditionsProps {
    status: MarketStatusData | null
}

export function MarketConditions({ status }: MarketConditionsProps) {
    const fundingRate = status?.funding_rates?.average || 0.0100
    const fundingHigh = fundingRate > 0.02
    const fundingLow = fundingRate < -0.01

    const warnings = []
    if (fundingHigh) warnings.push({ label: '費率過熱', level: 'high' })
    else if (fundingLow) warnings.push({ label: '費率轉負', level: 'medium' })
    else warnings.push({ label: '費率正常', level: 'low' })

    const volatility = status?.volatility_raw?.value || 30
    if (volatility > 60) warnings.push({ label: '高波動', level: 'high' })
    else warnings.push({ label: '波動收斂', level: 'low' })

    return (
        <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 mb-2 px-1">
                <ShieldCheck className="w-3 h-3 text-neutral-600" />
                <span className="text-[10px] font-mono text-[#666666] tracking-widest">風控中心</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {warnings.map((w, i) => {
                    const isHigh = w.level === 'high'
                    const borderColor = isHigh ? 'border-red-600/50' : 'border-[#1A1A1A]'
                    const textColor = isHigh ? 'text-red-500' : 'text-neutral-400'
                    const Icon = isHigh ? AlertTriangle : (i === 0 ? Lock : Eye)

                    return (
                        <div key={i} className={cn(
                            "bg-[#0A0A0A] border rounded-lg p-3 flex items-center justify-between",
                            borderColor
                        )}>
                            <span className={cn("text-xs font-bold", textColor)}>{w.label}</span>
                            <Icon className={cn("w-3.5 h-3.5", textColor)} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
