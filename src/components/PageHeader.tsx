'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
    title?: string
    backHref?: string
    backLabel?: string
    rightContent?: React.ReactNode
}

export function PageHeader({
    title,
    backHref = '/feed',
    backLabel = '返回',
    rightContent
}: PageHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-14">
            <div className="max-w-5xl mx-auto w-full px-4 h-full flex items-center justify-between">
                <Link
                    href={backHref}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {backLabel}
                </Link>

                {title && (
                    <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-white truncate max-w-[50%]">
                        {title}
                    </h1>
                )}

                <div className="flex items-center gap-2">
                    {rightContent}
                </div>
            </div>
        </header>
    )
}
