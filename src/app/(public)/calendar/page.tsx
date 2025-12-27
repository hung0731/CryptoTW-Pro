import { PageHeader } from '@/components/PageHeader'
import CalendarPageClient from '@/components/CalendarPageClient'
import { MacroEventsService } from '@/lib/services/macro-events'
import { Suspense } from 'react'
import { AISummaryCardSkeleton, CalendarEventSkeleton } from '@/components/ui/skeleton-components'
import { Metadata } from 'next'
import { BASE_URL } from '@/lib/seo-utils'

export const metadata: Metadata = {
    title: '幣圈財經日曆 & 重大事件 - Economic Calendar | CryptoTW Pro',
    description: '完整收錄美國 CPI、PCE、非農就業數據 (NFP)、FOMC 會議等影響加密貨幣市場的重大經濟事件。',
    keywords: ['財經日曆', 'CPI', 'FOMC', '非農', 'Bitcoin Calendar', 'Crypto Events'],
    alternates: {
        canonical: '/calendar',
    }
}

// Server Component
export default async function CalendarPage() {
    // Pre-calculate view model on server
    const enrichedEvents = await MacroEventsService.getCalendarViewModel()

    // Generate Event Schema List
    const upcomingEvents = enrichedEvents
        .map(e => e.nextOccurrence)
        .filter((occ): occ is NonNullable<typeof occ> => !!occ)
        .sort((a, b) => new Date(a.occursAt).getTime() - new Date(b.occursAt).getTime());

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '經濟日曆',
        description: '未來一週重大財經事件',
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: upcomingEvents.slice(0, 5).map((evt, i) => ({
                '@type': 'Event',
                position: i + 1,
                name: enrichedEvents.find(e => e.def.key === evt.eventKey)?.def.name || 'Macro Event',
                startDate: evt.occursAt,
                location: {
                    '@type': 'VirtualLocation',
                    name: 'Online'
                },
                description: `Forecast: ${evt.forecast || 'N/A'}`
            }))
        }
    }

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
