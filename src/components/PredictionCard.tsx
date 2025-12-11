'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PredictionCardProps {
    id: string
    title: string
    image: string
    probability?: string
    volume?: string
    className?: string
    type?: 'group' | 'single'
    groupOutcomes?: { label: string, probability: string }[]
}

export function PredictionCard({ title, image, probability, volume, className, type = 'single', groupOutcomes }: PredictionCardProps) {
    // Single Mode Logic
    const prob = probability ? parseFloat(probability) : 0
    const isHighProb = prob > 50

    return (
        <Card className={cn("bg-neutral-900 border-white/5 hover:border-white/20 transition-all duration-300 group", className)}>
            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-neu-800 shrink-0 overflow-hidden bg-neutral-800 border border-white/10 flex items-center justify-center">
                        <img src={image} alt="" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <h3 className="font-medium text-neutral-200 text-sm leading-snug line-clamp-2">
                        {title}
                    </h3>
                </div>

                {type === 'group' && groupOutcomes ? (
                    <div className="space-y-3 pt-2">
                        {groupOutcomes.map((outcome, idx) => {
                            const p = parseFloat(outcome.probability)
                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-[11px] text-neutral-400">
                                        <span>{outcome.label}</span>
                                        <span className={cn("font-mono", p > 50 ? "text-green-400 font-bold" : "")}>{outcome.probability}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", p > 50 ? "bg-green-500" : "bg-neutral-600")}
                                            style={{ width: `${p}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                            <div className="text-[10px] text-neutral-500 font-mono uppercase">Chance</div>
                            <span className={cn(
                                "text-2xl font-bold tracking-tight nums",
                                isHighProb ? "text-green-400" : "text-neutral-400"
                            )}>
                                {probability}%
                            </span>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border", isHighProb ? "border-green-500/20 bg-green-500/10 text-green-400" : "border-white/5 bg-white/5 text-neutral-500")}>
                            {isHighProb ? 'High' : 'Neutral'}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
