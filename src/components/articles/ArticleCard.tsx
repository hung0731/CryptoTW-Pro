'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
    slug: string;
    title: string;
    summary?: string | null;
    coverImageUrl?: string | null;
    category?: string;
    sourceName: string;
    readingTimeMinutes?: number;
    publishedAt?: string | null;
    isFeatured?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    analysis: '市場分析',
    macro: '總體經濟',
    onchain: '鏈上數據',
    airdrop: '空投研究',
    research: '深度研究'
};

export function ArticleCard({
    slug,
    title,
    summary,
    coverImageUrl,
    category = 'analysis',
    sourceName,
    readingTimeMinutes = 5,
    publishedAt,
    isFeatured = false
}: ArticleCardProps) {
    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
        : null;

    return (
        <Link href={`/articles/${slug}`} className="block group">
            <UniversalCard
                variant="clickable"
                size="M"
                className={cn(
                    "flex gap-4",
                    isFeatured && "ring-1 ring-yellow-500/30"
                )}
            >
                {/* Cover Image (Optional) */}
                {coverImageUrl && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900">
                        <img
                            src={coverImageUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                {CATEGORY_LABELS[category] || category}
                            </span>
                            {isFeatured && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                                    精選
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                            {title}
                        </h3>

                        {/* Summary */}
                        {summary && (
                            <p className="text-xs text-neutral-400 line-clamp-2">
                                {summary}
                            </p>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                        <div className="flex items-center gap-3">
                            <span>{sourceName}</span>
                            {formattedDate && <span>{formattedDate}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{readingTimeMinutes} 分鐘</span>
                        </div>
                    </div>
                </div>

                {/* Chevron */}
                <div className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all" />
                </div>
            </UniversalCard>
        </Link>
    );
}
