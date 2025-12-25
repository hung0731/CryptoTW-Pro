import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/articles - List all articles (including unpublished)
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch articles (admin)', error, { feature: 'admin-articles' });
            return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
        }

        return NextResponse.json({ articles: data || [] });
    } catch (error) {
        logger.error('Error in GET /api/admin/articles', error, { feature: 'admin-articles' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/articles - Create new article
export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();

        const {
            title, slug, summary, content, cover_image_url,
            category, tags, source_name, source_url, source_author,
            source_published_at, is_published, is_featured, reading_time_minutes
        } = body;

        if (!title || !slug || !content || !source_name || !source_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('articles')
            .insert({
                title,
                slug,
                summary,
                content,
                cover_image_url,
                category: category || 'analysis',
                tags: tags || [],
                source_name,
                source_url,
                source_author,
                source_published_at,
                is_published: is_published || false,
                is_featured: is_featured || false,
                reading_time_minutes: reading_time_minutes || 5,
                published_at: is_published ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (error) {
            logger.error('Failed to create article', error, { feature: 'admin-articles' });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ article: data }, { status: 201 });
    } catch (error) {
        logger.error('Error in POST /api/admin/articles', error, { feature: 'admin-articles' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
