import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// GET /api/events/[slug] - Get single event with side events
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const supabase = createAdminClient();

        // Get main event
        const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (error || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Increment view count
        supabase
            .from('events')
            .update({ view_count: (event.view_count || 0) + 1 })
            .eq('id', event.id)
            .then(() => { });

        // Get side events if this is a parent event
        const { data: sideEvents } = await supabase
            .from('events')
            .select('id, title, slug, start_date, end_date, venue_name, city, event_type, is_free')
            .eq('parent_event_id', event.id)
            .eq('is_published', true)
            .order('start_date', { ascending: true });

        // If this is a side event, get parent info
        let parentEvent = null;
        if (event.parent_event_id) {
            const { data: parent } = await supabase
                .from('events')
                .select('id, title, slug')
                .eq('id', event.parent_event_id)
                .single();
            parentEvent = parent;
        }

        return NextResponse.json({
            event,
            sideEvents: sideEvents || [],
            parentEvent
        });
    } catch (error) {
        logger.error('Error in GET /api/events/[slug]', error, { feature: 'events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
