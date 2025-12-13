'use client'

import { Home, Gift, User, TrendingUp, FileText, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    // Define navigation items (left side)
    const leftNavItems = [
        {
            label: '文章',
            icon: FileText,
            href: '/articles',
            active: pathname === '/articles' || pathname.startsWith('/content')
        },
        {
            label: '活動',
            icon: Gift,
            href: '/events',
            active: pathname === '/events'
        },
    ]

    // Define navigation items (right side)
    const rightNavItems = [
        {
            label: '數據',
            icon: TrendingUp,
            href: '/prediction',
            active: pathname === '/prediction'
        },
        {
            label: '大客戶',
            icon: Crown,
            href: '/vip',
            active: pathname === '/vip'
        }
    ]

    const isProActive = pathname === '/'

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 pb-safe">
            <nav className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {/* Left Nav Items */}
                {leftNavItems.map((item) => (
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

                {/* Center Pro Button */}
                <Link
                    href="/"
                    className="flex flex-col items-center justify-center w-full h-full -mt-4"
                >
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                        isProActive
                            ? "bg-white shadow-white/20"
                            : "bg-neutral-800 shadow-neutral-800/20 hover:bg-neutral-700"
                    )}>
                        <Sparkles className={cn("w-7 h-7", isProActive ? "text-black" : "text-white")} />
                    </div>
                    <span className={cn(
                        "text-[10px] font-medium mt-1",
                        isProActive ? "text-white" : "text-neutral-400"
                    )}>
                        Pro
                    </span>
                </Link>

                {/* Right Nav Items */}
                {rightNavItems.map((item) => (
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
