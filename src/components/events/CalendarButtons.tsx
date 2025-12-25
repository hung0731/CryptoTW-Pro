'use client';

import React from 'react';
import { Calendar, CalendarDays, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarButtonProps {
    event: {
        title: string;
        slug: string;
        start_date: string;
        end_date?: string;
        venue_name?: string;
        address?: string;
        city?: string;
        description?: string;
        registration_url?: string;
    };
}

function generateGoogleCalendarUrl(event: CalendarButtonProps['event']): string {
    const start = new Date(event.start_date);
    const end = event.end_date
        ? new Date(event.end_date)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const location = [event.venue_name, event.address, event.city].filter(Boolean).join(', ');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatDate(start)}/${formatDate(end)}`,
        details: `${event.description || ''}\n\n報名連結: ${event.registration_url || 'N/A'}`,
        location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function CalendarButtons({ event }: CalendarButtonProps) {
    const googleUrl = generateGoogleCalendarUrl(event);
    const icalUrl = `/api/events/${event.slug}/ical`;

    return (
        <div className="flex items-center gap-2">
            <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-white/10 text-white hover:bg-white/5 gap-2"
                >
                    <CalendarDays className="w-4 h-4" />
                    Google Calendar
                </Button>
            </a>
            <a href={icalUrl} download>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-white/10 text-white hover:bg-white/5 gap-2"
                >
                    <Download className="w-4 h-4" />
                    iCal
                </Button>
            </a>
        </div>
    );
}
