'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GitCompare } from 'lucide-react'
import { EventSelector } from '@/components/EventSelector'
import { CompareChart } from '@/components/CompareChart'
import { getReviewBySlug } from '@/lib/reviews-data'
import { Skeleton } from '@/components/ui/skeleton'

function CompareContent() {
    const searchParams = useSearchParams()
    const [eventA, setEventA] = useState<string | null>(searchParams.get('a'))
    const [eventB, setEventB] = useState<string | null>(searchParams.get('b'))

    // Get review data for insights
    const reviewA = eventA ? getReviewBySlug(eventA) : null
    const reviewB = eventB ? getReviewBySlug(eventB) : null

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/reviews" className="text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-sm font-bold flex items-center gap-2">
                    <GitCompare className="w-4 h-4" />
                    歷史對照
                </div>
                <div className="w-5" /> {/* Spacer */}
            </div>

            <div className="max-w-3xl mx-auto p-5 space-y-6">
                {/* Description */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">歷史對照</h1>
                    <p className="text-sm text-neutral-500">
                        將不同市場事件放在同一時間尺度，觀察市場結構如何崩解或修復
                    </p>
                </div>

                {/* Event Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    <EventSelector
                        label="事件 A"
                        value={eventA}
                        onChange={setEventA}
                        excludeSlug={eventB || undefined}
                    />
                    <EventSelector
                        label="事件 B"
                        value={eventB}
                        onChange={setEventB}
                        excludeSlug={eventA || undefined}
                    />
                </div>

                {/* Compare Chart */}
                <section className="rounded-lg border border-white/5 overflow-hidden" style={{ backgroundColor: '#0E0E0F' }}>
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-sm text-neutral-300">價格變化對比（正規化 %）</span>
                        <span className="text-[10px] text-neutral-600">T-0 = 事件發生日</span>
                    </div>
                    {eventA && eventB ? (
                        <CompareChart slugA={eventA} slugB={eventB} />
                    ) : (
                        <div className="aspect-video flex items-center justify-center text-neutral-500 text-sm">
                            請選擇兩個事件進行對比
                        </div>
                    )}
                </section>

                {/* Quick Insights */}
                {eventA && eventB && reviewA && reviewB && (
                    <section className="p-4 space-y-3 border-t border-white/5">
                        <h2 className="text-sm font-medium text-neutral-400">快速結論</h2>
                        <div className="space-y-3">
                            <div className="rounded-lg p-3" style={{ backgroundColor: '#0F0F10' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-0.5 bg-blue-500 rounded-full" />
                                    <span className="text-xs text-neutral-300 font-medium">{reviewA.title.split('：')[0]}</span>
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    {reviewA.context.realImpact}
                                </p>
                            </div>
                            <div className="rounded-lg p-3" style={{ backgroundColor: '#0F0F10' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-0.5 bg-red-500 rounded-full" />
                                    <span className="text-xs text-neutral-300 font-medium">{reviewB.title.split('：')[0]}</span>
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    {reviewB.context.realImpact}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Legend */}
                <div className="text-center text-[10px] text-neutral-600 pt-4">
                    價格以事件發生日（T-0）為基準正規化至 100%，X 軸顯示事件前後 30 日
                </div>
            </div>
        </main>
    )
}

export default function ComparePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Skeleton className="w-64 h-8 bg-neutral-900" />
            </div>
        }>
            <CompareContent />
        </Suspense>
    )
}
