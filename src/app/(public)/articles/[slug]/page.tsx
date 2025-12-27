
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArticlesService } from '@/lib/services/articles';
import { ArticleDetailClient } from '@/components/articles/ArticleDetailClient';
import { generateArticleSchema } from '@/lib/seo-utils';

interface Props {
    params: { slug: string }
}

// 1. Static Generation (Optional for latest articles)
export async function generateStaticParams() {
    const articles = await ArticlesService.getRecentArticles(20);
    return articles.map((article) => ({
        slug: article.slug,
    }));
}

// 2. Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = await ArticlesService.getArticleBySlug(params.slug);

    if (!article) {
        return {
            title: '文章未找到 - CryptoTW Pro'
        }
    }

    return {
        title: `${article.title} - CryptoTW Pro`,
        description: article.summary,
        keywords: article.tags,
        openGraph: {
            type: 'article',
            publishedTime: article.published_at,
            authors: [article.author || article.source_name],
            tags: article.tags,
            images: [
                article.cover_image_url || `/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.summary || '')}&type=article`
            ],
        },
        alternates: {
            canonical: `/articles/${params.slug}`,
        }
    }
}

// 3. Server Component
export default async function ArticlePage({ params }: Props) {
    const article = await ArticlesService.getArticleBySlug(params.slug);

    if (!article) {
        notFound();
    }

    const jsonLd = generateArticleSchema({
        title: article.title,
        description: article.summary || '',
        publishedAt: article.published_at,
        author: article.author || article.source_name,
        image: article.cover_image_url || undefined,
        slug: article.slug
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleDetailClient article={article} />
        </>
    );
}
