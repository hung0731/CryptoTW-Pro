'use client';

import React from 'react';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface SourceAttributionCardProps {
    sourceName: string;
    sourceUrl: string;
    sourceAuthor?: string | null;
    sourcePublishedAt?: string | null;
}

export function SourceAttributionCard({
    sourceName,
    sourceUrl,
    sourceAuthor,
    sourcePublishedAt
}: SourceAttributionCardProps) {
    const formattedDate = sourcePublishedAt
        ? new Date(sourcePublishedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })
        : null;

    return (
        <UniversalCard variant="subtle" size="S" className="bg-blue-950/20 border-blue-500/20">
            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center gap-2 text-blue-400">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">本文翻譯自</span>
                </div>

                {/* Source Info */}
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">{sourceName}</h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                        {sourceAuthor && (
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {sourceAuthor}
                            </span>
                        )}
                        {formattedDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formattedDate}
                            </span>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors group"
                >
                    閱讀原文
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
            </div>
        </UniversalCard>
    );
}
