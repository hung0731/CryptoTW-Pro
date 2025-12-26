'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TYPOGRAPHY } from '@/lib/design-tokens'

interface SectionHeaderCardProps {
    title: string
    description?: string
    icon?: React.ElementType
    rightElement?: React.ReactNode
    className?: string
}

/**
 * SectionHeaderCard
 * 
 * Replaces direct `<h2>` usage. Provides consistent grouping header.
 * Uses tertiary background to distinguish from Content Cards.
 */
export function SectionHeaderCard({
    title,
    description,
    icon: Icon,
    rightElement,
    className
}: SectionHeaderCardProps) {
    return (
        <div
            className={cn(
                "px-5 py-4 flex items-center justify-between",
                // Deep Tech Blue as requested
                "bg-[#0A0B14]",
                className
            )}
        >
            {/* Left: Title & Description */}
            <div className="flex flex-col">
                <h2 className={cn(TYPOGRAPHY.sectionTitle, "leading-tight text-base font-bold")}>
                    {title}
                </h2>
                {description && (
                    <span className={cn(TYPOGRAPHY.micro, "text-neutral-500 font-medium")}>
                        {description}
                    </span>
                )}
            </div>

            {/* Right: RightElement & Icon */}
            <div className="flex items-center gap-3">
                {rightElement}
                {Icon && <Icon strokeWidth={1.5} className="w-5 h-5 text-neutral-400" />}
            </div>
        </div>
    )
}
