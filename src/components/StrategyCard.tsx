'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle, Lightbulb, ArrowRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'

export type StrategyType = 'alert' | 'check' | 'insight'

interface StrategyCardProps {
    type: StrategyType
    title: string
    content: string
    citation?: {
        label: string
        href: string
    }
    className?: string
}

export function StrategyCard({ type, title, content, citation, className }: StrategyCardProps) {
    return (
        <div className={cn(
            "group overflow-hidden  p-5 transition-all duration-300",
            // Removed colored borders/bg, keeping it clean
            "hover:bg-[#111]",
            className
        )}>
            <div className="flex gap-4">
                {/* Icon Container - Monochrome */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    "bg-[#151515] border border-[#222]",
                    "text-neutral-400 group-hover:text-white transition-colors"
                )}>
                    {type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                    {type === 'check' && <CheckCircle className="w-4 h-4" />}
                    {type === 'insight' && <Lightbulb className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-bold text-[#E0E0E0] group-hover:text-white transition-colors">
                            {title}
                        </h4>
                    </div>

                    {/* Body */}
                    <p className={cn("text-sm leading-relaxed mb-3", COLORS.textSecondary)}>
                        {content}
                    </p>

                    {/* Citation / Link Action */}
                    {citation && (
                        <Link
                            href={citation.href}
                            className={cn(
                                "inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded",
                                "bg-[#1A1A1A] text-neutral-400 border border-[#2A2A2A]",
                                "hover:text-white hover:border-neutral-600 transition-colors"
                            )}
                        >
                            <ExternalLink className="w-3 h-3" />
                            {citation.label}
                            <ArrowRight className="w-2.5 h-2.5 ml-0.5 opacity-50" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
