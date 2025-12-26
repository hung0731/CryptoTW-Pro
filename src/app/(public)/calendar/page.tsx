import { PageHeader } from '@/components/PageHeader'
import CalendarPageClient from '@/components/CalendarPageClient'
import { MacroEventsService } from '@/lib/services/macro-events'
import { Suspense } from 'react'
import { AISummaryCardSkeleton, CalendarEventSkeleton } from '@/components/ui/skeleton-components'

// Server Component
export default async function CalendarPage() {
    // Pre-calculate view model on server
    const enrichedEvents = await MacroEventsService.getCalendarViewModel()

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <PageHeader title="經濟日曆" showLogo={false} backHref="/" backLabel="返回" />
            <Suspense fallback={
                <div className="px-4 pt-6 space-y-6">
                    <AISummaryCardSkeleton />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <CalendarEventSkeleton key={i} />
                        ))}
                    </div>
                </div>
            }>
                <CalendarPageClient enrichedEvents={enrichedEvents} />
            </Suspense>
        </main>
    )
}
