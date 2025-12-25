import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/articles/[id] - Update article
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();
        const body = await request.json();

        const updateData: Record<string, unknown> = {
            ...body,
            updated_at: new Date().toISOString()
        };

        // Set published_at if publishing for the first time
        if (body.is_published && !body.published_at) {
            updateData.published_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('articles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Failed to update article', error, { feature: 'admin-articles' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ article: data });
    } catch (error) {
        logger.error('Error in PUT /api/admin/articles/[id]', error, { feature: 'admin-articles' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Failed to delete article', error, { feature: 'admin-articles' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error in DELETE /api/admin/articles/[id]', error, { feature: 'admin-articles' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
