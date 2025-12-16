'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CARDS, SPACING } from '@/lib/design-tokens'

interface ContentCardProps {
    // Card variant
    variant?: 'article' | 'event' | 'prediction' | 'whale' | 'default'

    // Content
    title: string
    description?: string
    thumbnail?: string

    // Badge (e.g., "NEW", "HOT")
    badge?: string
    badgeColor?: 'green' | 'red' | 'yellow' | 'blue' | 'purple'

    // Meta info (e.g., date, source)
    meta?: string

    // Link destination
    href?: string
    external?: boolean

    // Click handler (alternative to href)
    onClick?: () => void

    // Custom class
    className?: string

    // Children for custom content
    children?: React.ReactNode
}

const badgeColors = {
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
}

export function ContentCard({
    variant = 'default',
    title,
    description,
    thumbnail,
    badge,
    badgeColor = 'green',
    meta,
    href,
    external = false,
    onClick,
    className,
    children
}: ContentCardProps) {

    const content = (
        <div className={cn(
            CARDS.secondary, SPACING.card, "group",
            className
        )}>
            <div className="flex gap-3">
                {/* Thumbnail */}
                {thumbnail && (
                    <img
                        src={thumbnail}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-white">
                            {title}
                        </h3>
                        {badge && (
                            <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-full shrink-0",
                                badgeColors[badgeColor]
                            )}>
                                {badge}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                            {description}
                        </p>
                    )}

                    {/* Meta */}
                    {meta && (
                        <p className="text-[10px] text-neutral-600 mt-1.5">
                            {meta}
                        </p>
                    )}

                    {/* Custom children */}
                    {children}
                </div>

                {/* Arrow */}
                {(href || onClick) && (
                    <ChevronRight className="w-4 h-4 text-[#666666] shrink-0 mt-1 group-hover:text-[#A0A0A0]" />
                )}
            </div>
        </div>
    )

    // Wrap with link if href provided
    if (href) {
        if (external) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {content}
                </a>
            )
        }
        return <Link href={href}>{content}</Link>
    }

    // Wrap with button if onClick provided
    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left">
                {content}
            </button>
        )
    }

    return content
}

// Compact list item variant
interface ListItemProps {
    title: string
    href?: string
    onClick?: () => void
    badge?: string
    rightElement?: React.ReactNode
}

export function ListItem({ title, href, onClick, badge, rightElement }: ListItemProps) {
    const content = (
        <div className="flex items-center justify-between p-3 hover:bg-[#0E0E0F]">
            <span className="text-xs text-neutral-300 line-clamp-1 flex-1">{title}</span>
            {badge && (
                <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full mx-2">
                    {badge}
                </span>
            )}
            {rightElement || <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />}
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }
    if (onClick) {
        return <button onClick={onClick} className="w-full text-left">{content}</button>
    }
    return content
}
