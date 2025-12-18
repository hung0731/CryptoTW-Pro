'use client';

import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SemanticChartCTAProps {
    label: string;
    indicatorSlug: string;
    className?: string;
}

export function SemanticChartCTA({ label, indicatorSlug, className }: SemanticChartCTAProps) {
    return (
        <Link
            href={`/indicators/${indicatorSlug}`}
            className={cn(
                "absolute top-3 right-3 z-20 group",
                "flex items-center gap-2",
                "px-3 py-1.5 rounded-full",
                "bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/20",
                "transition-all duration-300",
                className
            )}
        >
            <Search className="w-3 h-3 text-neutral-400 group-hover:text-white transition-colors" />
            <span className="text-[10px] text-neutral-400 group-hover:text-white transition-colors font-medium">
                🔎 {label}
            </span>
            <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0" />
        </Link>
    );
}
