'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SURFACE, RADIUS, TYPOGRAPHY, SPACING } from '@/lib/design-tokens'

interface SectionHeaderCardProps {
    title: string
    description?: string
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
    rightElement,
    className
}: SectionHeaderCardProps) {
    return (
        <div
            className={cn(
                SURFACE.tertiary,
                RADIUS.lg,
                "px-3 py-2 flex items-center justify-between",
                // Enforce margin bottom via token-based className if needed, 
                // but usually handled by parent <Section> gap. 
                // We keep it neutral here.
                className
            )}
        >
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <h2 className={cn(TYPOGRAPHY.sectionTitle, "leading-tight")}>
                        {title}
                    </h2>
                    {description && (
                        <span className={cn(TYPOGRAPHY.micro, "text-neutral-500 font-medium")}>
                            {description}
                        </span>
                    )}
                </div>
            </div>

            {rightElement && (
                <div className="flex items-center gap-2">
                    {rightElement}
                </div>
            )}
        </div>
    )
}
