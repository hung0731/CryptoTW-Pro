import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { getCache, setCache, CacheTTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/events - List events
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type');
        const city = searchParams.get('city');
        const organizer = searchParams.get('organizer');
        const upcoming = searchParams.get('upcoming') !== 'false'; // Default: only upcoming

        // Build cache key from query params
        const cacheKey = `api:events:${page}:${limit}:${type || 'all'}:${city || 'all'}:${organizer || 'none'}:${upcoming}`

        // Check cache first (5 min for events list)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const supabase = createAdminClient();
        const offset = (page - 1) * limit;

        let query = supabase
            .from('events')
            .select('*', { count: 'exact' })
            .eq('is_published', true)
            .is('parent_event_id', null) // Only main events, not side events
            .order('start_date', { ascending: true });

        // Organizer filter (for organizer pages)
        if (organizer) {
            query = query.eq('organizer_name', organizer);
        }

        if (upcoming && !organizer) {
            // Don't filter by upcoming if viewing organizer page (show all their events)
            query = query.gte('start_date', new Date().toISOString());
        }

        if (type && type !== 'all') {
            query = query.eq('event_type', type);
        }

        if (city && city !== 'all') {
            if (city === 'online') {
                query = query.eq('location_type', 'online');
            } else {
                query = query.eq('city', city);
            }
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            logger.error('Failed to fetch events', error, { feature: 'events' });
            return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
        }

        // Get featured events separately
        const { data: featuredData } = await supabase
            .from('events')
            .select('*')
            .eq('is_published', true)
            .eq('is_featured', true)
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(3);

        const result = {
            events: data || [],
            featured: featuredData || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };

        // Cache for 5 minutes
        await setCache(cacheKey, result, CacheTTL.MEDIUM);

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        });
    } catch (error) {
        logger.error('Error in GET /api/events', error, { feature: 'events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
