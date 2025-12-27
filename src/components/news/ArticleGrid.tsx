'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, User, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CARDS } from '@/lib/design-tokens'

interface ArticleItem {
    id: string
    title: string
    summary?: string
    thumbnail_url?: string
    created_at: string
    author?: string // If available
    type?: string
}

import { UniversalCard } from '@/components/ui/UniversalCard'

export function ArticleGrid({ items }: { items: ArticleItem[] }) {
    if (!items || items.length === 0) return null

    // Separate Featured Article (First one)
    const featured = items[0]
    const others = items.slice(1)

    return (
        <div className="space-y-8">
            {/* Featured Article */}
            {featured && (
                <Link href={`/content/${featured.id}`} className="group block">
                    <UniversalCard variant="clickable" className="relative aspect-video w-full overflow-hidden p-0 border-white/10">
                        {featured.thumbnail_url ? (
                            <img
                                src={featured.thumbnail_url}
                                alt={featured.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                                <span className="text-4xl">📰</span>
                            </div>
                        )}

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black border-none font-bold">
                                        {featured.type === 'alpha' ? '深度觀點' : '精選文章'}
                                    </Badge>
                                    <span className="text-xs text-neutral-300 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(featured.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-[#F59E0B] transition-colors">
                                    {featured.title}
                                </h2>
                                <p className="text-sm text-neutral-300 line-clamp-2 max-w-2xl">
                                    {featured.summary}
                                </p>
                            </div>
                        </div>
                    </UniversalCard>
                </Link>
            )}

            {/* Grid for Others */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {others.map((item) => (
                    <Link href={`/content/${item.id}`} key={item.id} className="group flex gap-4 items-start">
                        {/* Thumbnail */}
                        <UniversalCard variant="default" className="relative w-24 h-24 shrink-0 overflow-hidden p-0 rounded-lg">
                            {item.thumbnail_url ? (
                                <img
                                    src={item.thumbnail_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <span className="text-xl">📄</span>
                                </div>
                            )}
                        </UniversalCard>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                <span className="uppercase tracking-wider font-bold text-[#F59E0B]">
                                    {item.type === 'alpha' ? 'Alpha' : 'News'}
                                </span>
                                <span>•</span>
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-xs text-neutral-500 line-clamp-2">
                                {item.summary}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
