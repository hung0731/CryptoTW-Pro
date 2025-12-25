import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// GET /api/events/[slug]/ical - Generate iCal file
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;

        // Fetch event data
        const baseUrl = request.url.split('/api/')[0];
        const eventRes = await fetch(`${baseUrl}/api/events/${slug}`);

        if (!eventRes.ok) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const { event } = await eventRes.json();

        // Generate iCal content
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const escapeText = (text: string) => {
            return (text || '').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
        };

        const location = event.location_type === 'online'
            ? event.online_url || 'Online'
            : [event.venue_name, event.address, event.city].filter(Boolean).join(', ');

        const icalContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//CryptoTW Pro//Web3 Events//ZH',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${event.id}@cryptotw.pro`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${formatDate(startDate)}`,
            `DTEND:${formatDate(endDate)}`,
            `SUMMARY:${escapeText(event.title)}`,
            `DESCRIPTION:${escapeText(event.description || '')}\\n\\n報名連結: ${event.registration_url || 'N/A'}`,
            `LOCATION:${escapeText(location)}`,
            `URL:${baseUrl}/events/${event.slug}`,
            event.organizer_name ? `ORGANIZER;CN=${escapeText(event.organizer_name)}:mailto:noreply@cryptotw.pro` : '',
            'END:VEVENT',
            'END:VCALENDAR'
        ].filter(Boolean).join('\r\n');

        return new NextResponse(icalContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${slug}.ics"`
            }
        });
    } catch (error) {
        console.error('Error generating iCal:', error);
        return NextResponse.json({ error: 'Failed to generate calendar file' }, { status: 500 });
    }
}
