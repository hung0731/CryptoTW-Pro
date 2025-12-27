'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { SourceAttributionCard } from '@/components/articles/SourceAttributionCard';
import { Clock, Eye, Calendar, Share2 } from 'lucide-react';
import { SPACING } from '@/lib/design-tokens';
import ReactMarkdown from 'react-markdown';
import { Article } from '@/lib/services/articles';

interface Props {
    article: Article;
}

export function ArticleDetailClient({ article }: Props) {

    const handleShare = async () => {
        if (navigator.share && article) {
            await navigator.share({
                title: article.title,
                url: window.location.href
            });
        }
    };

    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <PageHeader title="深度文章" backHref="/articles" backLabel="返回" />

            <MobileOptimizedLayout className={SPACING.classes.mtHeader}>
                {/* Cover Image */}
                {article.cover_image_url && (
                    <div className="relative -mx-4 mb-6 aspect-video overflow-hidden">
                        <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                )}

                {/* Title & Meta */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-white mb-3 leading-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
                        {formattedDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formattedDate}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.reading_time_minutes} 分鐘閱讀
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.view_count} 次閱讀
                        </span>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Share2 className="w-3 h-3" />
                            分享
                        </button>
                    </div>
                </div>

                {/* Source Attribution */}
                <SourceAttributionCard
                    sourceName={article.source_name}
                    sourceUrl={article.source_url || ''}
                    sourceAuthor={article.author}
                    sourcePublishedAt={article.published_at}
                />

                {/* Content (Markdown) */}
                <article className="mt-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-neutral-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-blue-300 prose-code:bg-neutral-900 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                </article>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-neutral-900 text-neutral-400 rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Bottom Source Attribution (Repeat) */}
                <div className="mt-8 pt-6 border-t border-white/5">
                    <SourceAttributionCard
                        sourceName={article.source_name}
                        sourceUrl={article.source_url || ''}
                        sourceAuthor={article.author}
                        sourcePublishedAt={article.published_at}
                    />
                </div>
            </MobileOptimizedLayout>
        </main>
    );
}
