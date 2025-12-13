'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnifiedHeaderProps {
    // Level determines the header style
    // primary: Logo centered, profile on right (top-level pages)
    // secondary: Back button, title centered (sub-pages)
    // tertiary: Back button, title left-aligned (deep pages)
    level?: 'primary' | 'secondary' | 'tertiary'

    // Page title (for secondary/tertiary levels)
    title?: string

    // Show back button
    showBack?: boolean

    // Back button destination (defaults to browser back)
    backHref?: string

    // Right side action element
    rightAction?: React.ReactNode

    // Left side icon (for secondary level with icon)
    leftIcon?: React.ReactNode

    // Custom class name
    className?: string
}

export function UnifiedHeader({
    level = 'primary',
    title,
    showBack = false,
    backHref,
    rightAction,
    leftIcon,
    className
}: UnifiedHeaderProps) {

    const handleBack = () => {
        if (backHref) {
            window.location.href = backHref
        } else {
            window.history.back()
        }
    }

    // Primary level - Logo centered
    if (level === 'primary') {
        return (
            <header className={cn(
                "sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5",
                className
            )}>
                <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center justify-start">
                        {showBack && (
                            backHref ? (
                                <Link href={backHref} className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 text-neutral-400" />
                                </Link>
                            ) : (
                                <button onClick={handleBack} className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 text-neutral-400" />
                                </button>
                            )
                        )}
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="加密台灣 Pro" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        {rightAction}
                    </div>
                </div>
            </header>
        )
    }

    // Secondary level - Back + Title centered
    if (level === 'secondary') {
        return (
            <header className={cn(
                "sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5",
                className
            )}>
                <div className="flex items-center px-4 h-14 max-w-lg mx-auto">
                    {backHref ? (
                        <Link href={backHref} className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center mr-3">
                            <ArrowLeft className="w-4 h-4 text-neutral-400" />
                        </Link>
                    ) : (
                        <button onClick={handleBack} className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center mr-3">
                            <ArrowLeft className="w-4 h-4 text-neutral-400" />
                        </button>
                    )}
                    <div className="flex items-center gap-2 flex-1">
                        {leftIcon}
                        <h1 className="text-base font-bold text-white">{title}</h1>
                    </div>
                    {rightAction && (
                        <div className="flex items-center">
                            {rightAction}
                        </div>
                    )}
                </div>
            </header>
        )
    }

    // Tertiary level - Minimal back + title
    return (
        <header className={cn(
            "sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5",
            className
        )}>
            <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
                <div className="flex items-center">
                    {backHref ? (
                        <Link href={backHref} className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center mr-3">
                            <ArrowLeft className="w-4 h-4 text-neutral-400" />
                        </Link>
                    ) : (
                        <button onClick={handleBack} className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center mr-3">
                            <ArrowLeft className="w-4 h-4 text-neutral-400" />
                        </button>
                    )}
                    <h1 className="text-base font-bold text-white">{title}</h1>
                </div>
                {rightAction}
            </div>
        </header>
    )
}
