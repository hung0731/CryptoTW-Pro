import React from 'react'
import { SPACING, SECTION } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface SectionProps {
    children: React.ReactNode
    className?: string
    /**
     * Optional section title
     */
    title?: string
    /**
     * Optional section secondary label/subtitle
     */
    subtitle?: string
    /**
     * Optional right-side action or badge
     */
    action?: React.ReactNode
}

export function Section({ children, className, title, subtitle, action }: SectionProps) {
    return (
        <section className={cn("w-full min-w-0", className)}>
            {(title || subtitle || action) && (
                <div className={SECTION.headerWithGap}>
                    <div className="flex flex-col gap-0.5">
                        {title && <h3 className={SECTION.titlePrimary}>{title}</h3>}
                        {subtitle && <span className={SECTION.titleSecondary}>{subtitle}</span>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={cn("w-full", SPACING.cardGap)}>
                {children}
            </div>
        </section>
    )
}
