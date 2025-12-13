'use client'

import React from 'react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { BottomNav } from '@/components/BottomNav'
import { EconomicCalendar } from '@/components/CoinglassWidgets'
import { Globe, Filter, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <UnifiedHeader
                level="secondary"
                title="財經日曆"
                showBack={true}
            />

            <div className="p-4 space-y-5">
                {/* Calendar Component */}
                <EconomicCalendar />
            </div>

            <BottomNav />
        </main>
    )
}
