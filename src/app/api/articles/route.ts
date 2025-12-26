import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { getCache, setCache, CacheTTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/articles - List published articles
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const category = searchParams.get('category');
        const featured = searchParams.get('featured') === 'true';

        // Build cache key
        const cacheKey = `api:articles:${page}:${limit}:${category || 'all'}:${featured}`

        // Check cache first (5 min)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const supabase = createAdminClient();
        const offset = (page - 1) * limit;

        let query = supabase
            .from('articles')
            .select('id, title, slug, summary, cover_image_url, category, tags, source_name, reading_time_minutes, published_at, is_featured', { count: 'exact' })
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (category) {
            query = query.eq('category', category);
        }

        if (featured) {
            query = query.eq('is_featured', true);
        }

        const { data, error, count } = await query;

        if (error) {
            logger.error('Failed to fetch articles', error, { feature: 'articles' });
            return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
        }

        const result = {
            articles: data || [],
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
        logger.error('Error in GET /api/articles', error, { feature: 'articles' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
