import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/events - List all events (admin)
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch events (admin)', error, { feature: 'admin-events' });
            return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
        }

        return NextResponse.json({ events: data || [] });
    } catch (error) {
        logger.error('Error in GET /api/admin/events', error, { feature: 'admin-events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/events - Create new event
export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();

        const {
            title, slug, description, cover_image_url, event_type,
            start_date, end_date, timezone,
            location_type, venue_name, address, city, latitude, longitude, online_url,
            registration_url, registration_deadline, is_free, price_info,
            organizer_name, organizer_logo_url, organizer_url, co_organizers,
            parent_event_id, tags, is_published, is_featured
        } = body;

        if (!title || !slug || !start_date || !organizer_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('events')
            .insert({
                title, slug, description, cover_image_url,
                event_type: event_type || 'meetup',
                start_date, end_date, timezone: timezone || 'Asia/Taipei',
                location_type: location_type || 'physical',
                venue_name, address, city,
                latitude: latitude || null,
                longitude: longitude || null,
                online_url,
                registration_url, registration_deadline,
                is_free: is_free ?? true,
                price_info,
                organizer_name, organizer_logo_url, organizer_url,
                co_organizers: co_organizers || [],
                parent_event_id: parent_event_id || null,
                tags: tags || [],
                is_published: is_published || false,
                is_featured: is_featured || false
            })
            .select()
            .single();

        if (error) {
            logger.error('Failed to create event', error, { feature: 'admin-events' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: data }, { status: 201 });
    } catch (error) {
        logger.error('Error in POST /api/admin/events', error, { feature: 'admin-events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
