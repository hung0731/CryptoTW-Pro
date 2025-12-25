import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// GET /api/articles/[slug] - Get single article by slug
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        // Increment view count (fire and forget)
        supabase
            .from('articles')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id)
            .then(() => { });

        return NextResponse.json({ article: data });
    } catch (error) {
        logger.error('Error in GET /api/articles/[slug]', error, { feature: 'articles' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
