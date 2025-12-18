import React from 'react'
import { SPACING } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface PageShellProps {
    children: React.ReactNode
    className?: string
    /**
     * L1: Single Column (Public default)
     * L2: Two Column (Dashboard / Context)
     */
    variant?: 'L1' | 'L2'
}

export function PageShell({ children, className, variant = 'L1' }: PageShellProps) {
    return (
        <div
            className={cn(
                "min-h-screen w-full",
                SPACING.pageX, // Apply global page padding (p-4)
                className
            )}
        >
            <div className={cn(
                "mx-auto w-full",
                // L1: Max width 7xl (Standard)
                // L2: Full width or adjust as needed, but for now we keep 7xl containment for both to prevent ultra-wide 4k stretching
                "max-w-7xl"
            )}>
                {children}
            </div>
        </div>
    )
}

export function PageHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("mb-6", className)}>
            {children}
        </div>
    )
}

export function PageContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn(SPACING.sectionGap, className)}>
            {children}
        </div>
    )
}
