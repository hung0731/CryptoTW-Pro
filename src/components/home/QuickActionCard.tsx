'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UniversalCard, CardTitle } from '@/components/ui/UniversalCard'
import { TYPOGRAPHY } from '@/lib/design-tokens'

interface QuickActionCardProps {
    title: string
    href: string
    icon: React.ElementType
    variant?: 'primary' | 'secondary'
}

export function QuickActionCard({
    title,
    href,
    icon: Icon,
    variant = 'secondary'
}: QuickActionCardProps) {
    const isPrimary = variant === 'primary'

    return (
        <Link href={href} className="flex-1 block h-full">
            <UniversalCard
                variant={isPrimary ? 'default' : 'clickable'}
                size="S"
                className="h-full flex flex-col justify-between group"
            >
                {/* Top: Icon & Arrow */}
                <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isPrimary
                            ? "bg-white text-black"
                            : "bg-[#1A1A1A] text-[#808080] group-hover:text-white"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className={cn(
                        "w-4 h-4 transition-colors",
                        isPrimary
                            ? "text-[#404040]"
                            : "text-[#404040] group-hover:text-white"
                    )} />
                </div>

                {/* Bottom: Title */}
                <CardTitle className={cn(
                    isPrimary
                        ? "text-white"
                        : "text-[#A0A0A0] group-hover:text-white"
                )}>
                    {title}
                </CardTitle>
            </UniversalCard>
        </Link>
    )
}
