'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Filter } from 'lucide-react';
import { SPACING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface Article {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    cover_image_url: string | null;
    category: string;
    source_name: string;
    reading_time_minutes: number;
    published_at: string | null;
    is_featured: boolean;
}

const CATEGORIES = [
    { key: 'all', label: '全部' },
    { key: 'market_analysis', label: '市場分析' },
    { key: 'onchain_data', label: '鏈上數據' },
    { key: 'macro_economy', label: '總體經濟' },
    { key: 'project_research', label: '項目研究' },
    { key: 'industry_report', label: '產業報告' }
];

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const params = new URLSearchParams({ limit: '20' });
                if (selectedCategory !== 'all') {
                    params.set('category', selectedCategory);
                }

                const res = await fetch(`/api/articles?${params}`);
                const data = await res.json();
                setArticles(data.articles || []);
            } catch (error) {
                console.error('Failed to fetch articles:', error);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchArticles();
    }, [selectedCategory]);

    const featuredArticles = articles.filter(a => a.is_featured);
    const regularArticles = articles.filter(a => !a.is_featured);

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <PageHeader title="深度文章" backHref="/" backLabel="返回" />

            <MobileOptimizedLayout className={SPACING.classes.mtHeader}>
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={cn(
                                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                selectedCategory === cat.key
                                    ? "bg-white text-black"
                                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-28 bg-neutral-900 rounded-xl" />
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <UniversalCard variant="subtle" className="text-center py-12">
                        <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                        <p className="text-neutral-400">暫無文章</p>
                        <p className="text-xs text-neutral-600 mt-1">敬請期待更多深度內容</p>
                    </UniversalCard>
                ) : (
                    <div className="space-y-6">
                        {/* Featured Section */}
                        {featuredArticles.length > 0 && (
                            <section>
                                <SectionHeaderCard title="精選文章" icon={FileText} className="mb-3" />
                                <div className="space-y-3">
                                    {featuredArticles.map(article => (
                                        <ArticleCard
                                            key={article.id}
                                            slug={article.slug}
                                            title={article.title}
                                            summary={article.summary}
                                            coverImageUrl={article.cover_image_url}
                                            category={article.category}
                                            sourceName={article.source_name}
                                            readingTimeMinutes={article.reading_time_minutes}
                                            publishedAt={article.published_at}
                                            isFeatured
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* All Articles */}
                        <section>
                            {featuredArticles.length > 0 && (
                                <SectionHeaderCard title="所有文章" icon={Filter} className="mb-3" />
                            )}
                            <div className="space-y-3">
                                {regularArticles.map(article => (
                                    <ArticleCard
                                        key={article.id}
                                        slug={article.slug}
                                        title={article.title}
                                        summary={article.summary}
                                        coverImageUrl={article.cover_image_url}
                                        category={article.category}
                                        sourceName={article.source_name}
                                        readingTimeMinutes={article.reading_time_minutes}
                                        publishedAt={article.published_at}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </MobileOptimizedLayout>
        </main>
    );
}
