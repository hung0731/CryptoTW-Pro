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
    const config = {
        alert: {
            icon: AlertTriangle,
            baseColor: 'text-[#EF4444]', // Red
            bgColor: 'bg-[#EF4444]/10',
            borderColor: 'border-[#EF4444]/20',
            highlightColor: 'text-[#EF4444]'
        },
        check: {
            icon: CheckCircle,
            baseColor: 'text-[#22C55E]', // Green
            bgColor: 'bg-[#22C55E]/10',
            borderColor: 'border-[#22C55E]/20',
            highlightColor: 'text-[#22C55E]'
        },
        insight: {
            icon: Lightbulb,
            baseColor: 'text-[#F59E0B]', // Amber
            bgColor: 'bg-[#F59E0B]/10',
            borderColor: 'border-[#F59E0B]/20',
            highlightColor: 'text-[#F59E0B]'
        }
    }[type]

    const Icon = config.icon

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-xl border p-4 transition-all duration-300",
            "bg-[#0A0A0A] hover:bg-[#0E0E0F]",
            "border-[#1A1A1A] hover:border-[#2A2A2A]",
            className
        )}>
            {/* Left Accent Bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                config.bgColor.replace('/10', '')
            )} />

            <div className="flex gap-4">
                {/* Icon Container */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    config.bgColor,
                    config.borderColor,
                    "border"
                )}>
                    <Icon className={cn("w-4 h-4", config.baseColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5">
                        <h4 className={cn("text-xs font-bold tracking-wide uppercase", config.highlightColor)}>
                            {title}
                        </h4>

                        {/* Type Label (Optional, maybe for consistency) */}
                        {/* <span className="text-[9px] text-neutral-600 font-mono uppercase opacity-50">{type}</span> */}
                    </div>

                    {/* Body */}
                    <p className={cn("text-sm leading-relaxed font-medium mb-3", COLORS.textSecondary)}>
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
