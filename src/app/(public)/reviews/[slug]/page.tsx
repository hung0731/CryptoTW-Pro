'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReviewBySlug, getRelatedReviews, REVIEWS_DATA } from '@/lib/reviews-data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Share2, Clock, MapPin, Activity, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';
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

                {/* 2. Market State Snapshot (Status Adjectives) */}
                <section className="p-6 space-y-4 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        起始市場狀態快照
                    </h2>

                    <div className="grid grid-cols-1 gap-2">
                        {/* BTC */}
                        <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">BTC 價格狀態</span>
                            <span className="text-xs font-medium text-white text-right">{review.initialState.price}</span>
                        </div>

                        {/* F&G */}
                        <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">情緒 (恐懼/貪婪)</span>
                            <span className={cn(
                                "text-xs font-medium text-right",
                                review.initialState.fearGreed.includes('貪婪') ? "text-red-400" :
                                    review.initialState.fearGreed.includes('恐懼') ? "text-green-400" : "text-yellow-400"
                            )}>{review.initialState.fearGreed}</span>
                        </div>

                        {/* Optional Metrics */}
                        {review.initialState.etfFlow && (
                            <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">ETF 資金</span>
                                <span className="text-xs font-medium text-white text-right">{review.initialState.etfFlow}</span>
                            </div>
                        )}
                        {review.initialState.oi && (
                            <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">合約持倉 (OI)</span>
                                <span className="text-xs font-medium text-white text-right">{review.initialState.oi}</span>
                            </div>
                        )}
                        {review.initialState.funding && (
                            <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">資金費率</span>
                                <span className="text-xs font-medium text-white text-right">{review.initialState.funding}</span>
                            </div>
                        )}
                        {review.initialState.stablecoin && (
                            <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">穩定幣流動性</span>
                                <span className="text-xs font-medium text-white text-right">{review.initialState.stablecoin}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Timeline (Risk Focus) */}
                <section className="p-6 space-y-6 border-b border-white/5 relative overflow-hidden">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider relative z-10">
                        <Activity className="w-4 h-4" />
                        事件演變與風險狀態
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
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Key Takeaways (Lessons) */}
                <section className="p-6 space-y-4">
                    <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2 uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4" />
                        這次市場教會我們什麼？
                    </h2>

                    <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-5 space-y-4">
                        <ul className="space-y-3">
                            {review.takeaways.map((point, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-neutral-200 leading-relaxed">
                                    <span className="text-amber-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
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
