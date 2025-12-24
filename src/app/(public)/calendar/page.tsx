import { PageHeader } from '@/components/PageHeader'
import CalendarClient from '@/components/CalendarClient'
import { MacroEventsService } from '@/lib/services/macro-events'

// Server Component
export default async function CalendarPage() {
    // Pre-calculate view model on server
    const enrichedEvents = MacroEventsService.getCalendarViewModel()

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <PageHeader title="經濟日曆" showLogo={false} backHref="/" backLabel="返回" />
            <CalendarClient enrichedEvents={enrichedEvents} />
        </main>
    )
}
