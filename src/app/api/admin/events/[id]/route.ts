import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();
        const body = await request.json();

        const updateData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Failed to update event', error, { feature: 'admin-events' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: data });
    } catch (error) {
        logger.error('Error in PUT /api/admin/events/[id]', error, { feature: 'admin-events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Failed to delete event', error, { feature: 'admin-events' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error in DELETE /api/admin/events/[id]', error, { feature: 'admin-events' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
