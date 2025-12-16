'use client'

import Link from 'next/link'
import { BarChart3, Bell, Calendar, Star, TrendingUp, Wallet, Crown } from 'lucide-react'
import { CARDS } from '@/lib/design-tokens'

interface QuickAction {
    icon: React.ReactNode
    label: string
    href: string
    color: string
}

const actions: QuickAction[] = [
    {
        icon: <BarChart3 className="w-4 h-4" />,
        label: '數據',
        href: '/prediction',
        color: 'text-neutral-400'
    },

    {
        icon: <Bell className="w-4 h-4" />,
        label: '提醒',
        href: '/profile/notifications',
        color: 'text-neutral-400'
    },
    {
        icon: <Crown className="w-4 h-4" />,
        label: 'VIP',
        href: '/join',
        color: 'text-neutral-400'
    }
]

export function QuickActions() {
    return (
        <div className="flex items-center justify-between gap-2">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    href={action.href}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 ${CARDS.secondary}`}
                >
                    <div className={action.color}>{action.icon}</div>
                    <span className="text-[10px] text-neutral-400">{action.label}</span>
                </Link>
            ))}
        </div>
    )
}
