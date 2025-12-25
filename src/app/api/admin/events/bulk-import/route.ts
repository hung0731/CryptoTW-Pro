import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface CSVEvent {
    title: string;
    slug?: string;
    description?: string;
    event_type?: string;
    start_date: string;
    end_date?: string;
    venue_name?: string;
    address?: string;
    city?: string;
    location_type?: string;
    registration_url?: string;
    is_free?: string;
    organizer_name: string;
    parent_event_slug?: string; // For side events
}

// POST /api/admin/events/bulk-import - Import events from CSV data
export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { events: csvEvents } = body as { events: CSVEvent[] };

        if (!csvEvents || !Array.isArray(csvEvents) || csvEvents.length === 0) {
            return NextResponse.json({ error: 'No events data provided' }, { status: 400 });
        }

        const results: { success: string[]; failed: { title: string; error: string }[] } = {
            success: [],
            failed: []
        };

        // Get all existing events for parent lookup
        const { data: existingEvents } = await supabase
            .from('events')
            .select('id, slug');

        const slugToId: Record<string, string> = {};
        existingEvents?.forEach(e => {
            slugToId[e.slug] = e.id;
        });

        for (const csvEvent of csvEvents) {
            try {
                if (!csvEvent.title || !csvEvent.start_date || !csvEvent.organizer_name) {
                    results.failed.push({
                        title: csvEvent.title || 'Unknown',
                        error: 'Missing required fields (title, start_date, organizer_name)'
                    });
                    continue;
                }

                // Generate slug if not provided
                const slug = csvEvent.slug ||
                    csvEvent.title.toLowerCase()
                        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
                        .replace(/^-|-$/g, '')
                        .slice(0, 50) + '-' + Date.now().toString(36);

                // Look up parent event
                let parentEventId = null;
                if (csvEvent.parent_event_slug && slugToId[csvEvent.parent_event_slug]) {
                    parentEventId = slugToId[csvEvent.parent_event_slug];
                }

                const eventData = {
                    title: csvEvent.title,
                    slug,
                    description: csvEvent.description || null,
                    event_type: csvEvent.event_type || 'meetup',
                    start_date: new Date(csvEvent.start_date).toISOString(),
                    end_date: csvEvent.end_date ? new Date(csvEvent.end_date).toISOString() : null,
                    venue_name: csvEvent.venue_name || null,
                    address: csvEvent.address || null,
                    city: csvEvent.city || null,
                    location_type: csvEvent.location_type || 'physical',
                    registration_url: csvEvent.registration_url || null,
                    is_free: csvEvent.is_free?.toLowerCase() !== 'false',
                    organizer_name: csvEvent.organizer_name,
                    parent_event_id: parentEventId,
                    is_published: false,
                    timezone: 'Asia/Taipei'
                };

                const { error } = await supabase
                    .from('events')
                    .insert(eventData);

                if (error) {
                    results.failed.push({ title: csvEvent.title, error: error.message });
                } else {
                    results.success.push(csvEvent.title);
                    // Add to lookup for subsequent side events
                    slugToId[slug] = 'pending'; // Mark as created
                }
            } catch (e) {
                results.failed.push({
                    title: csvEvent.title || 'Unknown',
                    error: e instanceof Error ? e.message : 'Unknown error'
                });
            }
        }

        logger.info('Bulk import completed', {
            feature: 'admin-events',
            success: results.success.length,
            failed: results.failed.length
        });

        return NextResponse.json({
            message: `Imported ${results.success.length} events, ${results.failed.length} failed`,
            results
        });
    } catch (error) {
        logger.error('Error in bulk import', error, { feature: 'admin-events' });
        return NextResponse.json({ error: 'Bulk import failed' }, { status: 500 });
    }
}
