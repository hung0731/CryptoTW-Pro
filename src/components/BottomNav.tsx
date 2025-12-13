'use client'

import React from 'react'
import { Home, Bell, BarChart2, Calendar, User } from 'lucide-react'
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
            icon: Bell,
            href: '/alerts',
            active: pathname === '/alerts'
        },
        {
            label: '數據',
            icon: BarChart2,
            href: '/prediction',
            active: pathname === '/prediction'
        },
        {
            label: '日曆',
            icon: Calendar,
            href: '/calendar',
            active: pathname === '/calendar'
        },
        {
            label: '我的',
            icon: User,
            href: '/profile',
            active: pathname === '/profile'
        }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 pb-safe">
            <nav className="flex items-center justify-between h-16 max-w-md mx-auto px-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 transition-colors duration-200",
                            item.active
                                ? "text-white"
                                : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <div className={cn(
                            "p-1 rounded-xl transition-all",
                            // item.active && "bg-white/10"
                        )}>
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-all duration-200",
                                    item.active && "fill-current"
                                )}
                                strokeWidth={item.active ? 0 : 2}
                            />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
