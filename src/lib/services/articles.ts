import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { getCache, setCache, CacheTTL } from '@/lib/cache';

export interface Article {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    content: string; // Markdown or HTML
    cover_image_url: string | null;
    category: string;
    tags: string[];
    source_name: string;
    source_url: string | null;
    author: string | null;
    reading_time_minutes: number;
    published_at: string;
    updated_at: string;
    view_count: number;
    is_featured: boolean;
}

export class ArticlesService {

    // Fetch single article by slug
    static async getArticleBySlug(slug: string): Promise<Article | null> {
        try {
            // Check cache
            const cacheKey = `article:slug:${slug}`;
            const cached = await getCache<Article>(cacheKey);
            if (cached) return cached;

            const supabase = createAdminClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .eq('is_published', true)
                .single();

            if (error || !data) {
                return null;
            }

            // Fire and forget view count increment
            void supabase
                .from('articles')
                .update({ view_count: (data.view_count || 0) + 1 })
                .eq('id', data.id)
                .then();

            const article = data as Article;
            await setCache(cacheKey, article, CacheTTL.FAST); // 1 min cache for freshness vs speed

            return article;
        } catch (error) {
            logger.error(`Failed to fetch article ${slug}`, error, { feature: 'articles-service' });
            return null;
        }
    }

    // List articles (for potential sitemap or list pages)
    static async getRecentArticles(limit = 10): Promise<Article[]> {
        try {
            const cacheKey = `articles:recent:${limit}`;
            const cached = await getCache<Article[]>(cacheKey);
            if (cached) return cached;

            const supabase = createAdminClient();
            const { data, error } = await supabase
                .from('articles')
                .select('id, slug, title, published_at, updated_at')
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) return [];

            const articles = data as Article[];
            await setCache(cacheKey, articles, CacheTTL.MEDIUM);

            return articles;
        } catch (error) {
            return [];
        }
    }
}
