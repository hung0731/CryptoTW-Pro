'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLiff } from '@/components/LiffProvider'

interface PageHeaderProps {
    title?: string // Optional: Center title instead of Logo
    backHref?: string // Optional: Left Back Button
    backLabel?: string // Optional: Label for Back Button
    showLogo?: boolean // Default: true
}

export function PageHeader({
    title,
    backHref,
    backLabel,
    showLogo = true
}: PageHeaderProps) {
    const { profile } = useLiff()

    return (
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
            {/* Gradient Separator */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
            <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto">
                {/* Left: Back Button or Empty */}
                <div className="flex items-center justify-start">
                    {backHref && (
                        <Link href={backHref}>
                            <Button variant="ghost" className="hover:bg-white/10 text-neutral-400 hover:text-white rounded-full h-8 px-2 -ml-2 text-sm font-medium">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                {backLabel}
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Center: Logo or Title */}
                <div className="flex items-center justify-center">
                    {title ? (
                        <span className="text-sm font-bold text-white truncate max-w-[150px]">{title}</span>
                    ) : showLogo ? (
                        <img src="/logo.svg" alt="加密台灣 Pro" className="h-4 w-auto" />
                    ) : null}
                </div>

                {/* Right: Profile Icon */}
                <div className="flex items-center justify-end">
                    {profile && (
                        <Link href="/profile">
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                                <img src={profile.pictureUrl} alt="Profile" className="relative w-9 h-9 rounded-full ring-2 ring-white/10 group-hover:ring-white transition-all shadow-lg" />
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
