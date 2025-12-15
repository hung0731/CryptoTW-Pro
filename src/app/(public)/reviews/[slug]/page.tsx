'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReviewBySlug, getRelatedReviews, REVIEWS_DATA } from '@/lib/reviews-data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Share2, Clock, MapPin, Activity, AlertTriangle, Lightbulb, BookOpen, CheckCircle, XCircle, GitCompare, ListChecks, TrendingUp, BarChart3, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const review = getReviewBySlug(slug);

    if (!review) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Event not found</div>;
    }

    const relatedReviews = getRelatedReviews(review.marketStates[0]).filter(r => r.id !== review.id);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/reviews" className="text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px]">{review.title}</div>
                <button className="text-neutral-400 hover:text-white">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <article className="max-w-3xl mx-auto">
                {/* Hero Section */}
                <div className="p-6 space-y-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={cn(
                            "border-0 px-2 py-0.5",
                            review.importance === 'S' ? "bg-red-900/30 text-red-500" : "bg-blue-900/30 text-blue-500"
                        )}>
                            {review.importance} 級事件
                        </Badge>
                        <span className="text-xs text-neutral-500 font-mono">{review.year}</span>
                    </div>

                    <h1 className="text-2xl font-bold leading-tight tracking-tight">
                        {review.title}
                    </h1>

                    <div className="bg-neutral-900/50 rounded-lg p-4 border-l-2 border-primary">
                        <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                            {review.summary}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        {review.tags.map(tag => (
                            <span key={tag}>#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* 1. Context (The Setup) */}
                <section className="p-6 space-y-4 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        事件脈絡
                    </h2>
                    <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5 space-y-3">
                        <div>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">發生了什麼</span>
                            <p className="text-sm text-neutral-200 leading-relaxed">{review.context.what}</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">當時主流敘事</span>
                            <p className="text-sm text-neutral-400 leading-relaxed">{review.context.narrative}</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div>
                            <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block mb-1">真正影響市場的是</span>
                            <p className="text-sm text-amber-400/90 leading-relaxed font-medium">{review.context.realImpact}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Visual Evidence (Main Chart & Flow) */}
                {(review.charts.main || review.charts.flow) && (
                    <section className="p-6 space-y-6 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4" />
                            關鍵視覺證據
                        </h2>

                        {/* Main Chart: Price Action */}
                        {review.charts.main && (
                            <div className="space-y-2">
                                <div className="aspect-video w-full bg-neutral-900 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                                    <span className="text-neutral-600 text-xs font-mono">Main Chart: {review.charts.main.url.split('/').pop()}</span>
                                    {/* <img src={review.charts.main.url} className="w-full h-full object-cover" /> */}
                                </div>
                                <div className="bg-neutral-900/50 border-l-2 border-white/20 pl-3 py-2 rounded-r-lg">
                                    <p className="text-xs text-neutral-300 leading-relaxed">
                                        <span className="text-white font-bold mr-1">圖表解讀：</span>
                                        {review.charts.main.caption.replace('圖表解讀：', '')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Flow Chart: The Soul */}
                        {review.charts.flow && (
                            <div className="space-y-2">
                                <div className="aspect-video w-full bg-neutral-900 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                                    <span className="text-neutral-600 text-xs font-mono">Flow Chart: {review.charts.flow.url.split('/').pop()}</span>
                                    {/* <img src={review.charts.flow.url} className="w-full h-full object-cover" /> */}
                                </div>
                                <div className="bg-green-950/10 border-l-2 border-green-500/30 pl-3 py-2 rounded-r-lg">
                                    <p className="text-xs text-neutral-300 leading-relaxed">
                                        <span className="text-green-400 font-bold mr-1">圖表解讀：</span>
                                        {review.charts.flow.caption.replace('圖表解讀：', '')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* 3. Market State Snapshot */}
                <section className="p-6 space-y-4 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        起始市場狀態快照
                    </h2>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">BTC 價格狀態</span>
                            <span className="text-xs font-medium text-white text-right">{review.initialState.price}</span>
                        </div>
                        <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">情緒 (恐懼/貪婪)</span>
                            <span className={cn(
                                "text-xs font-medium text-right",
                                review.initialState.fearGreed.includes('貪婪') ? "text-red-400" :
                                    review.initialState.fearGreed.includes('恐懼') ? "text-green-400" : "text-yellow-400"
                            )}>{review.initialState.fearGreed}</span>
                        </div>
                        {review.initialState.funding && (
                            <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">資金費率</span>
                                <span className="text-xs font-medium text-white text-right">{review.initialState.funding}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. Cognitive Mismatch (New Module) */}
                {review.misconceptions && (
                    <section className="p-6 space-y-4 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <AlertOctagon className="w-4 h-4" />
                            市場認知誤區
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {review.misconceptions.map((m, idx) => (
                                <div key={idx} className="bg-neutral-900/30 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="flex items-start gap-3 p-3 bg-red-950/10 border-b border-white/5">
                                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">常見誤判</span>
                                            <p className="text-xs text-neutral-300 font-medium">{m.myth}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-green-950/10">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider block">實際真相</span>
                                            <p className="text-xs text-neutral-300 font-medium">{m.fact}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Timeline (Risk Focus) */}
                <section className="p-6 space-y-6 border-b border-white/5 relative overflow-hidden">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider relative z-10">
                        <Activity className="w-4 h-4" />
                        事件演變與風險釋放
                    </h2>

                    <div className="absolute left-[39px] top-16 bottom-10 w-0.5 bg-neutral-800 z-0"></div>

                    <div className="space-y-8 relative z-10">
                        {review.timeline.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[50px] pt-1">
                                    <span className="text-[10px] font-mono text-neutral-500 bg-black px-1 rounded">
                                        {item.date.slice(5)}
                                    </span>
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700 border-2 border-black mt-1"></div>
                                </div>
                                <div className="flex-1 space-y-2 pb-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                                            {item.riskState}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="mt-2 bg-neutral-900/50 p-2.5 rounded-lg border-l-2 border-neutral-600">
                                        <span className="text-[10px] text-neutral-500 block mb-0.5 uppercase tracking-wider">市場行為改變</span>
                                        <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                                            {item.marketImpact}
                                        </p>
                                    </div>

                                    {/* Feature: OI Chart or other specific timeline charts could be injected here if we had timeline-attached charts */}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* OI Chart specifically placed after timeline or as part of summary */}
                    {review.charts.oi && (
                        <div className="mt-6 space-y-2 bg-neutral-900/20 p-4 rounded-xl border border-white/5 mx-4 relative z-10">
                            <div className="aspect-[21/9] w-full bg-neutral-900 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                                <span className="text-neutral-600 text-xs font-mono">OI Chart: {review.charts.oi.url.split('/').pop()}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-neutral-500 mt-0.5" />
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    <span className="text-neutral-300 font-bold mr-1">圖表解讀：</span>
                                    {review.charts.oi.caption.replace('圖表解讀：', '')}
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* 6. Historical Comparison (New Module) */}
                {review.historicalComparison && (
                    <section className="p-6 space-y-4 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <GitCompare className="w-4 h-4" />
                            歷史相似案例
                        </h2>
                        <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                    對照：{review.historicalComparison.event}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                                {review.historicalComparison.similarity}
                            </p>
                        </div>
                    </section>
                )}

                {/* 7. Actionable Checklist (New Module - Replaces Takeaways) */}
                <section className="p-6 space-y-4">
                    <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2 uppercase tracking-wider">
                        <ListChecks className="w-4 h-4" />
                        下次遇到，該檢查什麼？
                    </h2>

                    <div className="space-y-3">
                        {review.actionableChecklist.map((item, idx) => (
                            <div key={idx} className={cn(
                                "flex gap-3 p-4 rounded-xl border",
                                item.type === 'alert'
                                    ? "bg-red-950/10 border-red-500/20"
                                    : "bg-neutral-900/30 border-white/10"
                            )}>
                                {item.type === 'alert' ? (
                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <h3 className={cn(
                                        "text-xs font-bold mb-1",
                                        item.type === 'alert' ? "text-red-400" : "text-green-400"
                                    )}>
                                        {item.label}
                                    </h3>
                                    <p className="text-sm text-neutral-300 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related CTA */}
                {relatedReviews.length > 0 && (
                    <section className="p-6 pt-0">
                        <div className="h-px bg-white/5 mb-6" />
                        <h3 className="text-xs font-bold text-neutral-500 mb-3">相似案例推薦</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {relatedReviews.map(r => (
                                <Link href={`/reviews/${r.slug}`} key={r.id}>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/30 border border-white/5 hover:bg-neutral-800 transition-colors">
                                        <div>
                                            <div className="text-xs font-bold text-neutral-300">{r.title}</div>
                                            <div className="text-[10px] text-neutral-600 mt-0.5">{r.year} · {r.importance} 級事件</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </main>
    );
}

import { ChevronRight } from 'lucide-react';
