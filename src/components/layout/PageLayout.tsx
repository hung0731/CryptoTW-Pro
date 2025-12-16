import React from 'react'
import { SPACING } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface LayoutProps {
    children: React.ReactNode
    className?: string
}

/**
 * L1: Single Column Layout (Default)
 * - Max Width: 7xl
 * - Aligned: Center
 */
export function SingleColumnLayout({ children, className }: LayoutProps) {
    return (
        <div className={cn("w-full max-w-7xl mx-auto", SPACING.pageX, className)}>
            <div className={cn("flex flex-col", SPACING.sectionGap)}>
                {children}
            </div>
        </div>
    )
}

/**
 * L2: Two Column Layout (Dashboard)
 * - Ratio: 8:4 (2:1)
 * - Mobile: Collapse to Single Column (Left stacks on top of Right)
 */
interface TwoColumnLayoutProps extends LayoutProps {
    leftColumn: React.ReactNode
    rightColumn: React.ReactNode
    /**
     * Optional header that spans full width before the split
     */
    header?: React.ReactNode
}

export function TwoColumnLayout({ header, leftColumn, rightColumn, className }: TwoColumnLayoutProps) {
    return (
        <div className={cn("w-full max-w-7xl mx-auto", SPACING.pageX, className)}>
            <div className={cn("flex flex-col", SPACING.sectionGap)}>
                {/* L1 Header Area */}
                {header && (
                    <div className="w-full">
                        {header}
                    </div>
                )}

                {/* L2 Grid Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Primary Column (Left) - spans 8 */}
                    <main className="lg:col-span-8 flex flex-col gap-6 min-w-0">
                        {leftColumn}
                    </main>

                    {/* Secondary Column (Right) - spans 4 */}
                    <aside className="lg:col-span-4 flex flex-col gap-6 min-w-0">
                        {rightColumn}
                    </aside>
                </div>
            </div>
        </div>
    )
}

/**
 * L3: Full Width Layout (Landing Only)
 * - Use strictly for marketing headers
 * - Forbidden in app routes
 */
export function FullWidthLayout({ children, className }: LayoutProps) {
    return (
        <div className={cn("w-full", className)}>
            {children}
        </div>
    )
}
