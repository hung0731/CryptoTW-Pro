'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SURFACE, BORDER, RADIUS, SPACING, TYPOGRAPHY, ANIMATION, FOCUS } from '@/lib/design-tokens'

// Strict Variant Types
export type CardVariant = 'default' | 'subtle' | 'highlight' | 'danger' | 'success' | 'clickable' | 'ghost' | 'luma' | 'lumaSubtle' | 'lumaClickable'
export type CardSize = 'S' | 'M' | 'L'
export type CardTone = 'neutral' | 'positive' | 'negative'

interface UniversalCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant
    size?: CardSize
    tone?: CardTone
    as?: React.ElementType
    children: React.ReactNode
}

/**
 * UniversalCard (Design System Core)
 * 
 * Defines the container style based on variant and size.
 * Addresses "luma" legacy by consolidating them into base styles.
 */
export function UniversalCard({
    variant = 'default',
    size = 'M',
    tone = 'neutral',
    as: Component = 'div',
    className,
    children,
    ...props
}: UniversalCardProps) {

    // Helper for unified clickable behavior
    const clickableBase = cn(
        SURFACE.cardPrimary,
        BORDER.primary,
        "hover:border-neutral-400 transition-all duration-200",
        ANIMATION.activePress,
        FOCUS.ringSubtle,
        "cursor-pointer group overflow-hidden"
    )

    // Resolve Styles based on Variant
    const variantStyles = {
        default: cn(SURFACE.cardPrimary, BORDER.primary),
        subtle: cn(SURFACE.cardPassive, BORDER.dashed),
        highlight: cn(SURFACE.highlight, BORDER.highlight),
        danger: cn(SURFACE.danger, BORDER.danger),
        success: cn('bg-[#0F1C12]', 'border border-[#113311]'),
        clickable: clickableBase,
        ghost: cn(SURFACE.ghost, BORDER.ghost, "hover:bg-[#1A1A1A]/30", ANIMATION.hoverCard),

        // Consolidated Legacy Variants
        luma: cn(SURFACE.cardPrimary, BORDER.primary), // Map directly to default
        lumaSubtle: cn(SURFACE.cardPassive, BORDER.primary), // Map directly to subtle but with primary border
        lumaClickable: clickableBase, // Map directly to clickable
    }

    // Resolve Radius & Padding based on Size
    const sizeStyles = {
        S: cn(RADIUS.lg, "p-3"),
        M: cn(RADIUS.xl, "p-4"),
        L: cn(RADIUS.xl, "p-5"),
    }

    return (
        <Component
            className={cn(
                "relative overflow-hidden w-full",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {children}
        </Component>
    )
}

// Sub-components remains the same...
export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1 mb-3", className)}>{children}</div>
}

export function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn(TYPOGRAPHY.cardTitle, className)}>{children}</h3>
}

export function CardDescription({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn(TYPOGRAPHY.cardSubtitle, className)}>{children}</p>
}

export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex-1", className)}>{children}</div>
}

export function CardFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("mt-auto pt-3 flex items-center justify-between text-[10px] text-[#666666]", className)}>{children}</div>
}
