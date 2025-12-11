'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'

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

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-white/10 p-2 rounded shadow-xl text-xs">
                <p className="text-white font-medium mb-1">{payload[0].payload.label}</p>
                <p className="text-neutral-400">機率: <span className="text-white font-mono">{payload[0].value}%</span></p>
            </div>
        )
    }
    return null
}

export function PredictionCard({ title, image, probability, volume, className, type = 'single', groupOutcomes }: PredictionCardProps) {
    // Single Mode Logic
    const prob = probability ? parseFloat(probability) : 0
    const isHighProb = prob > 50

    return (
        <Card className={cn("bg-neutral-900 border-white/5 hover:border-white/20 transition-all duration-300 group", className)}>
            <CardContent className="p-4 flex flex-col justify-between gap-4 h-full">
                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-neu-800 shrink-0 overflow-hidden bg-neutral-800 border border-white/10 flex items-center justify-center">
                        <img src={image} alt="" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <h3 className="font-medium text-neutral-200 text-sm leading-snug line-clamp-2">
                        {title}
                    </h3>
                </div>

                {type === 'group' && groupOutcomes ? (
                    <div className="h-[180px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={groupOutcomes}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                barCategoryGap={10}
                            >
                                <XAxis type="number" hide domain={[0, 100]} />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#a3a3a3', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={20}>
                                    {groupOutcomes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={parseFloat(entry.probability) > 50 ? '#4ade80' : '#525252'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
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
            </CardContent >
        </Card >
    )
}
