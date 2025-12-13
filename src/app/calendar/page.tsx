'use client'

import React from 'react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { BottomNav } from '@/components/BottomNav'
import { EconomicCalendar } from '@/components/CoinglassWidgets'
import { Globe, Filter, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
    // Default to 'key' (S-Tier)
    const [filter, setFilter] = React.useState<'key' | 'all'>('key')

    const FilterBtn = ({ label, value, icon: Icon }: any) => (
        <Button
            variant={filter === value ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(value)}
            className={cn(
                "h-8 text-xs rounded-full px-4 shrink-0 transition-all",
                filter === value
                    ? "bg-white text-black hover:bg-neutral-200 font-bold"
                    : "bg-transparent border-white/20 text-neutral-300 hover:bg-white/10"
            )}
        >
            {Icon && <Icon className="w-3 h-3 mr-1.5" />}
            {label}
        </Button>
    )

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <UnifiedHeader
                level="secondary"
                title="財經日曆"
                showBack={true}
            />

            <div className="p-4 space-y-5">
                {/* Filters */}
                <div className="flex items-center gap-2 pb-2">
                    <FilterBtn label="🔥 核心重點 (S級)" value="key" icon={Star} />
                    <FilterBtn label="全部監控 (A級+)" value="all" icon={Globe} />
                </div>

                {/* Calendar Component */}
                <EconomicCalendar filter={filter} />
            </div>

            <BottomNav />
        </main>
    )
}
