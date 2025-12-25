import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

// PUT /api/admin/rewards/[id] - Update reward
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();
        const json = await request.json();

        // Remove uneditable fields or fields that shouldn't be updated directly via this endpoint if any
        const updateData = { ...json };
        delete updateData.id;
        delete updateData.created_at;

        const { data, error } = await supabase
            .from('rewards')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Failed to update reward', error, { feature: 'admin-rewards' });
            return NextResponse.json({ error: 'Failed to update reward' }, { status: 500 });
        }

        return NextResponse.json({ reward: data });
    } catch (error) {
        logger.error('Error in PUT /api/admin/rewards/[id]', error, { feature: 'admin-rewards' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/rewards/[id] - Delete reward
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('rewards')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Failed to delete reward', error, { feature: 'admin-rewards' });
            return NextResponse.json({ error: 'Failed to delete reward' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error in DELETE /api/admin/rewards/[id]', error, { feature: 'admin-rewards' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
