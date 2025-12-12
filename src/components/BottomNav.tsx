'use client'

import { Home, Gift, User, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    // Define navigation items
    const navItems = [
        {
            label: '文章',
            icon: Home,
            href: '/',
            active: pathname === '/' || pathname.startsWith('/content')
        },
        {
            label: '活動',
            icon: Gift,
            href: '/events',
            active: pathname === '/events'
        },
        {
            label: '數據',
            icon: TrendingUp,
            href: '/prediction', // Keep same route for now to avoid breaking existing links
            active: pathname === '/prediction'
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
            <nav className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                            item.active
                                ? "text-white"
                                : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <item.icon
                            className={cn(
                                "w-6 h-6 transition-all duration-200",
                                item.active && "fill-current"
                            )}
                            strokeWidth={item.active ? 0 : 2}
                        />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
