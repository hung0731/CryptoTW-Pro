'use client'

import React from 'react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { BottomNav } from '@/components/BottomNav'
import { EconomicCalendar } from '@/components/CoinglassWidgets'
import { Globe, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CalendarPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <UnifiedHeader
                level="secondary"
                title="財經日曆"
                showBack={true}
                rightAction={
                    <Button variant="ghost" size="icon" className="text-neutral-400">
                        <Filter className="w-5 h-5" />
                    </Button>
                }
            />

            <div className="p-4 space-y-5">
                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-neutral-200 h-8 text-xs font-bold rounded-full px-4 shrink-0">
                        全部
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-neutral-300 hover:bg-white/10 h-8 text-xs rounded-full px-4 shrink-0">
                        <Globe className="w-3 h-3 mr-1" />
                        美國 (USD)
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-neutral-300 hover:bg-white/10 h-8 text-xs rounded-full px-4 shrink-0">
                        🇪🇺 歐元區
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-neutral-300 hover:bg-white/10 h-8 text-xs rounded-full px-4 shrink-0">
                        🇨🇳 中國
                    </Button>
                </div>

                {/* Calendar Component */}
                <EconomicCalendar />
            </div>

            <BottomNav />
        </main>
    )
}
