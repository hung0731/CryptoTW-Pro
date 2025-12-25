'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface QuickNavItem {
    slug: string
    name: string
    category?: string
}

interface QuickNavigationProps {
    items: QuickNavItem[]
    currentSlug: string
    baseUrl: string
    title?: string
}

/**
 * 快速導航選單
 * - Sticky 在頁面頂部（PageHeader 下方）
 * - 水平滾動的標籤列表
 * - 高亮當前頁面
 */
export function QuickNavigation({
    items,
    currentSlug,
    baseUrl,
    title = "快速切換"
}: QuickNavigationProps) {
    const pathname = usePathname()

    if (items.length === 0) return null

    return (
        <div className="sticky top-14 z-30 bg-black/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto scrollbar-hide">
                {/* 標題 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-neutral-600 font-medium">{title}</span>
                    <ChevronRight className="w-3 h-3 text-neutral-700" />
                </div>

                {/* 導航項目 */}
                <div className="flex items-center gap-2">
                    {items.map((item) => {
                        const isActive = currentSlug === item.slug
                        const href = `${baseUrl}/${item.slug}`

                        return (
                            <Link
                                key={item.slug}
                                href={href}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0",
                                    "border",
                                    isActive
                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                        : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.name}
                                {item.category && (
                                    <span className="ml-1 opacity-60 text-[10px]">
                                        {item.category}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* 顯示總數 */}
                <div className="flex-shrink-0 ml-auto">
                    <span className="text-[10px] text-neutral-700 font-mono">
                        {items.findIndex(i => i.slug === currentSlug) + 1}/{items.length}
                    </span>
                </div>
            </div>

            {/* 滾動提示（漸層） */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/95 to-transparent pointer-events-none" />
        </div>
    )
}

/**
 * 自動生成相關項目的快速導航
 */
export function AutoQuickNav({
    allItems,
    currentSlug,
    baseUrl,
    maxItems = 8,
    filterFn
}: {
    allItems: QuickNavItem[]
    currentSlug: string
    baseUrl: string
    maxItems?: number
    filterFn?: (item: QuickNavItem) => boolean
}) {
    // 過濾並限制數量
    let filtered = allItems
    if (filterFn) {
        filtered = filtered.filter(filterFn)
    }

    // 確保當前項目在列表中
    const currentIndex = filtered.findIndex(i => i.slug === currentSlug)
    if (currentIndex === -1) {
        // 如果當前項目不在過濾後的列表中，加入它
        const current = allItems.find(i => i.slug === currentSlug)
        if (current) {
            filtered = [current, ...filtered].slice(0, maxItems)
        }
    } else {
        // 以當前項目為中心，取前後各幾個
        const half = Math.floor(maxItems / 2)
        const start = Math.max(0, currentIndex - half)
        const end = Math.min(filtered.length, start + maxItems)
        filtered = filtered.slice(start, end)
    }

    return (
        <QuickNavigation
            items={filtered}
            currentSlug={currentSlug}
            baseUrl={baseUrl}
        />
    )
}
