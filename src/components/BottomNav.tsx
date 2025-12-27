'use client'

import React from 'react'
import { Home, Newspaper, BarChart2, User, BookOpen, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            label: '首頁',
            icon: Home,
            href: '/',
            active: pathname === '/'
        },
        {
            label: '快訊',
            icon: Newspaper,
            href: '/news',
            active: pathname === '/news'
        },
        {
            label: '指標',
            icon: BarChart2,
            href: '/indicators',
            active: pathname.startsWith('/indicators')
        },
        {
            label: '日曆',
            icon: Calendar,
            href: '/calendar',
            active: pathname === '/calendar'
        },
        {
            label: '覆盤',
            icon: BookOpen,
            href: '/history',
            active: pathname.startsWith('/history')
        },
        {
            label: '我的',
            icon: User,
            href: '/me',
            active: pathname === '/me'
        }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F10]/80 backdrop-blur-xl border-t border-white/10 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.5)]">
            <nav className="flex items-center justify-between h-16 max-w-md mx-auto px-6">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 py-1", // Added py-1
                            item.active
                                ? "text-white"
                                : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <div className={cn(
                            "p-1 rounded-xl",
                            // item.active && "bg-white/10"
                        )}>
                            <item.icon
                                className={cn(
                                    "w-5 h-5",
                                    // Removed fill-current as it breaks line-based icons like BarChart2
                                    item.active && "drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                                )}
                                strokeWidth={item.active ? 2.5 : 1.5}
                            />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
