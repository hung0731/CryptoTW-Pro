'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SURFACE, BORDER, RADIUS, SPACING, TYPOGRAPHY, ANIMATION, FOCUS } from '@/lib/design-tokens'

// Strict Variant Types
export type CardVariant = 'default' | 'subtle' | 'highlight' | 'danger' | 'success' | 'clickable' | 'ghost'
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
 * DOES NOT handle internal layout (Header/Body/Footer). Use sub-components for that.
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

    // Resolve Styles based on Variant
    const variantStyles = {
        default: cn(SURFACE.cardPrimary, BORDER.primary),
        subtle: cn(SURFACE.cardPassive, BORDER.dashed),
        highlight: cn(SURFACE.highlight, BORDER.highlight),
        danger: cn(SURFACE.danger, BORDER.danger),
        success: cn('bg-[#0F1C12]', 'border border-[#113311]'), // Green tint per v3.0 spec
        clickable: cn(
            SURFACE.cardPrimary,
            BORDER.primary,
            "hover:bg-[#141414] hover:border-[#2A2A2A]",
            ANIMATION.hoverCard,
            ANIMATION.activePress,
            FOCUS.ringSubtle,
            "cursor-pointer group"
        ),
        ghost: cn(SURFACE.ghost, BORDER.ghost, "hover:bg-[#1A1A1A]/30", ANIMATION.hoverCard),
    }

    // Resolve Radius & Padding based on Size
    const sizeStyles = {
        S: cn(RADIUS.lg, "p-3"), // Small cards use tighter radius/padding
        M: cn(RADIUS.xl, "p-4"), // Standard
        L: cn(RADIUS.xl, "p-5"), // Large/Primary
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

// Sub-components for Internal Structure
// --------------------------------------------------------

export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1 mb-3", className)}>{children}</div>
}

export function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn(TYPOGRAPHY.cardTitle, className)}>{children}</h3>
}

export function CardDescription({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn(TYPOGRAPHY.cardSubtitle, className)}>{children}</p>
}

// Content wrapper to enforce vertical rhythm
export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex-1", className)}>{children}</div>
}

export function CardFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("mt-auto pt-3 flex items-center justify-between text-[10px] text-[#666666]", className)}>{children}</div>
}
