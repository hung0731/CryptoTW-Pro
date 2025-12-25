import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/events/stats - Get event statistics
export async function GET() {
    try {
        const supabase = createAdminClient();
        const now = new Date().toISOString();

        // Total events
        const { count: totalEvents } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true });

        // Published events
        const { count: publishedEvents } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        // Upcoming events
        const { count: upcomingEvents } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)
            .gte('start_date', now);

        // Past events
        const { count: pastEvents } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)
            .lt('start_date', now);

        // Total bookmarks
        const { count: totalBookmarks } = await supabase
            .from('event_bookmarks')
            .select('*', { count: 'exact', head: true });

        // Total views
        const { data: viewsData } = await supabase
            .from('events')
            .select('view_count');
        const totalViews = viewsData?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0;

        // Top events by views
        const { data: topByViews } = await supabase
            .from('events')
            .select('id, title, slug, view_count, start_date')
            .eq('is_published', true)
            .order('view_count', { ascending: false })
            .limit(5);

        // Top events by bookmarks
        const { data: bookmarkCounts } = await supabase
            .from('event_bookmarks')
            .select('event_id');

        const bookmarksByEvent: Record<string, number> = {};
        bookmarkCounts?.forEach(b => {
            bookmarksByEvent[b.event_id] = (bookmarksByEvent[b.event_id] || 0) + 1;
        });

        // Events by type
        const { data: eventsByType } = await supabase
            .from('events')
            .select('event_type')
            .eq('is_published', true);

        const typeDistribution: Record<string, number> = {};
        eventsByType?.forEach(e => {
            typeDistribution[e.event_type] = (typeDistribution[e.event_type] || 0) + 1;
        });

        // Events by city
        const { data: eventsByCity } = await supabase
            .from('events')
            .select('city, location_type')
            .eq('is_published', true);

        const cityDistribution: Record<string, number> = {};
        eventsByCity?.forEach(e => {
            const key = e.location_type === 'online' ? '線上' : (e.city || '未指定');
            cityDistribution[key] = (cityDistribution[key] || 0) + 1;
        });

        // This month events
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const { count: thisMonthEvents } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)
            .gte('start_date', startOfMonth.toISOString())
            .lt('start_date', endOfMonth.toISOString());

        return NextResponse.json({
            overview: {
                totalEvents: totalEvents || 0,
                publishedEvents: publishedEvents || 0,
                upcomingEvents: upcomingEvents || 0,
                pastEvents: pastEvents || 0,
                thisMonthEvents: thisMonthEvents || 0,
                totalBookmarks: totalBookmarks || 0,
                totalViews
            },
            topByViews: topByViews || [],
            bookmarksByEvent,
            typeDistribution,
            cityDistribution
        });
    } catch (error) {
        logger.error('Error fetching event stats', error, { feature: 'admin-events' });
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
