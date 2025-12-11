'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PredictionCardProps {
    id: string
    title: string
    image: string
    probability: string
    volume: string
    className?: string
}

export function PredictionCard({ title, image, probability, volume, className }: PredictionCardProps) {
    const prob = parseFloat(probability)
    const isHighProb = prob > 50

    return (
        <Card className={cn("bg-neutral-900 border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 group", className)}>
            <div className="aspect-[2/1] relative overflow-hidden bg-neutral-950">
                <img
                    src={image}
                    alt={title}
                    className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/10 text-[10px] font-mono">
                        Vol: ${parseInt(volume).toLocaleString()}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-white leading-snug line-clamp-2 h-10 text-sm">
                    {title}
                </h3>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Yes Probability</span>
                        <span className={cn(
                            "text-2xl font-bold tracking-tight",
                            isHighProb ? "text-green-400" : "text-neutral-400"
                        )}>
                            {probability}%
                        </span>
                    </div>

                    {/* Visual Indicator */}
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/5">
                        <TrendingUp className={cn("w-5 h-5", isHighProb ? "text-green-400" : "text-neutral-600")} />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full", isHighProb ? "bg-green-500" : "bg-neutral-500")}
                        style={{ width: `${probability}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
