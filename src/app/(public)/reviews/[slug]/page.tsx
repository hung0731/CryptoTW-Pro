'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReviewBySlug, getRelatedReviews, REVIEWS_DATA } from '@/lib/reviews-data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Share2, Clock, MapPin, Activity, AlertTriangle, Lightbulb, BookOpen, CheckCircle, XCircle, GitCompare, ListChecks, TrendingUp, BarChart3, AlertOctagon } from 'lucide-react';
import { ReviewChart } from '@/components/ReviewChart';
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

                    {/* Summary Card - Fixed Style */}
                    <div className="bg-neutral-900/40 rounded-xl p-5 border border-white/10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                        <p className="text-sm text-neutral-200 leading-relaxed font-medium pl-2">
                            {review.summary}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-500 pt-2">
                        {review.tags.map(tag => (
                            <span key={tag} className="bg-neutral-900 px-2 py-1 rounded border border-white/5">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* 1. Context (The Setup) */}
                <section className="p-6 space-y-5 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        事件脈絡
                    </h2>
                    <div className="bg-neutral-900/30 rounded-xl p-5 border border-white/5 space-y-4">
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pt-1">發生了什麼</span>
                            <p className="text-sm text-neutral-200 leading-relaxed">{review.context.what}</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pt-1">當時主流敘事</span>
                            <p className="text-sm text-neutral-400 leading-relaxed">{review.context.narrative}</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider pt-1">真正影響市場的是</span>
                            <p className="text-sm text-amber-400/90 leading-relaxed font-medium">{review.context.realImpact}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Visual Evidence (Review Charts) */}
                {(review.charts.main || review.charts.flow) && (
                    <section className="p-6 space-y-6 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4" />
                            關鍵視覺證據
                        </h2>

                        {/* Main Chart */}
                        {review.charts.main && (
                            <div className="space-y-3">
                                <div className="aspect-video w-full bg-neutral-900/50 rounded-xl border border-white/5 flex items-center justify-center p-2 relative">
                                    <ReviewChart
                                        type="price"
                                        symbol={review.chartConfig?.symbol || 'BTC'}
                                        daysBuffer={review.chartConfig?.daysBuffer}
                                        eventStart={review.eventStartAt}
                                        eventEnd={review.eventEndAt}
                                        reviewSlug={review.slug}
                                    />
                                    <div className="absolute top-2 left-3">
                                        <Badge variant="secondary" className="bg-black/50 text-[10px] border-white/10 backdrop-blur">Price Action</Badge>
                                    </div>
                                </div>
                                <div className="bg-neutral-900/30 border border-white/5 p-3 rounded-lg flex items-start gap-2">
                                    <span className="text-blue-400 font-bold text-xs whitespace-nowrap pt-0.5">圖表解讀：</span>
                                    <p className="text-xs text-neutral-300 leading-relaxed">
                                        {review.charts.main.caption.replace('圖表解讀：', '')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Flow Chart */}
                        {review.charts.flow && (
                            <div className="space-y-3">
                                <div className="aspect-video w-full bg-neutral-900/50 rounded-xl border border-white/5 flex items-center justify-center p-2 relative">
                                    <ReviewChart
                                        type={review.slug.includes('etf') || review.slug.includes('luna') ? 'flow' : 'oi'}
                                        symbol={review.chartConfig?.symbol || 'BTC'}
                                        daysBuffer={review.chartConfig?.daysBuffer}
                                        eventStart={review.eventStartAt}
                                        eventEnd={review.eventEndAt}
                                        reviewSlug={review.slug}
                                    />
                                    <div className="absolute top-2 left-3">
                                        <Badge variant="secondary" className="bg-black/50 text-[10px] border-white/10 backdrop-blur">
                                            {review.slug.includes('luna') ? 'Supply Inflation' : 'Net Flow'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="bg-neutral-900/30 border border-white/5 p-3 rounded-lg flex items-start gap-2">
                                    <span className="text-green-400 font-bold text-xs whitespace-nowrap pt-0.5">圖表解讀：</span>
                                    <p className="text-xs text-neutral-300 leading-relaxed">
                                        {review.charts.flow.caption.replace('圖表解讀：', '')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* 3. Market State Snapshot */}
                <section className="p-6 space-y-5 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        起始市場狀態快照
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5 space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">價格狀態</span>
                            <div className="text-xs font-medium text-white leading-relaxed">{review.initialState.price}</div>
                        </div>
                        <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5 space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">情緒指標</span>
                            <div className={cn(
                                "text-xs font-medium",
                                review.initialState.fearGreed.includes('貪婪') ? "text-red-400" :
                                    review.initialState.fearGreed.includes('恐懼') ? "text-green-400" : "text-yellow-400"
                            )}>
                                {review.initialState.fearGreed}
                            </div>
                        </div>
                        <div className="col-span-2 bg-neutral-900/30 rounded-xl p-4 border border-white/5 space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">資金與籌碼</span>
                            <div className="text-xs text-neutral-300">
                                {review.initialState.funding && <span className="block mb-1">• {review.initialState.funding}</span>}
                                {review.initialState.etfFlow && <span className="block mb-1">• {review.initialState.etfFlow}</span>}
                                {review.initialState.oi && <span className="block mb-1">• {review.initialState.oi}</span>}
                                {review.initialState.stablecoin && <span className="block">• {review.initialState.stablecoin}</span>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Cognitive Mismatch */}
                {review.misconceptions && (
                    <section className="p-6 space-y-5 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <AlertOctagon className="w-4 h-4" />
                            市場認知誤區
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {review.misconceptions.map((m, idx) => (
                                <div key={idx} className="bg-neutral-900/30 rounded-xl border border-white/5 overflow-hidden flex flex-col md:flex-row">
                                    <div className="p-4 bg-red-950/10 md:w-1/2 border-b md:border-b-0 md:border-r border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">常見誤判</span>
                                        </div>
                                        <p className="text-xs text-neutral-300 font-medium leading-relaxed">{m.myth}</p>
                                    </div>
                                    <div className="p-4 bg-green-950/10 md:w-1/2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">實際真相</span>
                                        </div>
                                        <p className="text-xs text-neutral-300 font-medium leading-relaxed">{m.fact}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Timeline - Enhanced Design */}
                <section className="p-6 space-y-6 border-b border-white/5 relative">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider z-10 relative">
                        <Activity className="w-4 h-4" />
                        事件演變與風險釋放
                    </h2>

                    {/* Continuous Line */}
                    <div className="absolute left-[39px] top-16 bottom-6 w-px bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-800 z-0"></div>

                    <div className="space-y-8 relative z-10">
                        {review.timeline.map((item, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                {/* Date Bubble */}
                                <div className="flex flex-col items-center gap-1 min-w-[50px] pt-1">
                                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded shadow-sm">
                                        {item.date.slice(5)}
                                    </span>
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border-2 border-neutral-600 group-hover:border-blue-500 group-hover:scale-110 transition-all mt-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1">
                                    <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 hover:bg-neutral-900/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-black/40 text-neutral-400 border border-white/5">
                                                {item.riskState}
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                                            {item.description}
                                        </p>

                                        <div className="bg-black/30 p-2 rounded-lg flex items-start gap-2">
                                            <Activity className="w-3 h-3 text-neutral-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-neutral-400 leading-relaxed">
                                                <span className="text-neutral-500 mr-1">市場行為：</span>{item.marketImpact}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* OI Chart at the end of timeline */}
                    {review.charts.oi && (
                        <div className="mt-8 relative z-10 pl-[66px]">
                            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                                        <BarChart3 className="w-3.5 h-3.5" /> 持倉量 (OI) 變化
                                    </span>
                                </div>
                                <div className="aspect-[21/9] w-full bg-neutral-900/50 rounded-lg border border-white/5 p-2">
                                    <ReviewChart
                                        type="oi"
                                        symbol={review.chartConfig?.symbol || 'BTC'}
                                        daysBuffer={review.chartConfig?.daysBuffer}
                                        eventStart={review.eventStartAt}
                                        eventEnd={review.eventEndAt}
                                    />
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    <span className="text-yellow-500 font-bold mr-1">解讀：</span>
                                    {review.charts.oi.caption.replace('圖表解讀：', '')}
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* 6. Historical Comparison */}
                {review.historicalComparison && (
                    <section className="p-6 space-y-5 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <GitCompare className="w-4 h-4" />
                            歷史相似案例
                        </h2>
                        <div className="bg-neutral-900/30 rounded-xl p-5 border border-white/5 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-400 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                                    對照：{review.historicalComparison.event}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-300 leading-relaxed pl-1">
                                {review.historicalComparison.similarity}
                            </p>
                        </div>
                    </section>
                )}

                {/* 7. Actionable Checklist */}
                <section className="p-6 space-y-5">
                    <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2 uppercase tracking-wider">
                        <ListChecks className="w-4 h-4" />
                        下次遇到，該檢查什麼？
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        {review.actionableChecklist.map((item, idx) => (
                            <div key={idx} className={cn(
                                "flex gap-4 p-4 rounded-xl border transition-all hover:bg-white/[0.02]",
                                item.type === 'alert'
                                    ? "bg-red-950/5 border-red-500/20"
                                    : "bg-neutral-900/30 border-white/10"
                            )}>
                                {item.type === 'alert' ? (
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className={cn(
                                        "text-xs font-bold mb-1.5 uppercase tracking-wide",
                                        item.type === 'alert' ? "text-red-400" : "text-green-400"
                                    )}>
                                        {item.label}
                                    </h3>
                                    <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer Quote */}
                <div className="px-6 pb-12 text-center">
                    <p className="text-[10px] text-neutral-600 font-mono">
                        "History doesn't repeat itself, but it often rhymes."
                    </p>
                </div>


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
