import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// POST - Add bookmark
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const supabase = createAdminClient();
        const body = await request.json();
        const { user_id, notify_before_hours = 24 } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get event ID from slug
        const { data: event } = await supabase
            .from('events')
            .select('id')
            .eq('slug', slug)
            .single();

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Create bookmark
        const { data, error } = await supabase
            .from('event_bookmarks')
            .upsert({
                user_id,
                event_id: event.id,
                notify_before_hours
            }, {
                onConflict: 'user_id,event_id'
            })
            .select()
            .single();

        if (error) {
            logger.error('Failed to create bookmark', error, { feature: 'events' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ bookmark: data });
    } catch (error) {
        logger.error('Error in POST bookmark', error, { feature: 'events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove bookmark
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get event ID
        const { data: event } = await supabase
            .from('events')
            .select('id')
            .eq('slug', slug)
            .single();

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Delete bookmark
        const { error } = await supabase
            .from('event_bookmarks')
            .delete()
            .eq('user_id', user_id)
            .eq('event_id', event.id);

        if (error) {
            logger.error('Failed to delete bookmark', error, { feature: 'events' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error in DELETE bookmark', error, { feature: 'events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
