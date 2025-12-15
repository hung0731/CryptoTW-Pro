'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReviewBySlug, getRelatedReviews } from '@/lib/reviews-data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, Clock, BookOpen, CheckCircle, XCircle, GitCompare, ListChecks, TrendingUp, BarChart3, AlertOctagon, ChevronDown, ChevronUp, ChevronRight, Lightbulb, Activity, AlertTriangle } from 'lucide-react';
import { ReviewChart } from '@/components/ReviewChart';
import { cn } from '@/lib/utils';

export default function ReviewDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const review = getReviewBySlug(slug);
    const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

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
                <div className="p-6 pb-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={cn(
                            "border-0 px-2 py-0.5",
                            review.importance === 'S' ? "bg-red-900/30 text-red-500" : "bg-blue-900/30 text-blue-500"
                        )}>
                            {review.importance} 級事件
                        </Badge>
                        <span className="text-xs text-neutral-500 font-mono">{review.year}</span>
                    </div>

                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
                        {review.title}
                    </h1>

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        {review.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-neutral-900 px-2 py-1 rounded border border-white/5">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* 1. Quick Guide Card (Executive Summary) */}
                <section className="px-6 mb-6">
                    <div className="bg-neutral-900/60 rounded-xl p-5 border border-white/10 shadow-sm relative overflow-hidden group">
                        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" />
                            快速導讀
                        </h2>
                        <p className="text-[10px] text-neutral-500 mb-3 pl-5">給已經忘記細節的人 30 秒回顧</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="w-1 h-1 rounded-full bg-neutral-500 mt-2 flex-shrink-0"></span>
                                <div>
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide block mb-0.5">事件本質 Nature</span>
                                    <p className="text-sm text-neutral-300 leading-relaxed font-medium">{review.context.what.split('。')[0]}。</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1 h-1 rounded-full bg-neutral-500 mt-2 flex-shrink-0"></span>
                                <div>
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide block mb-0.5">核心機制 Mechanism</span>
                                    <p className="text-sm text-neutral-300 leading-relaxed font-medium">{review.summary}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1 h-1 rounded-full bg-neutral-500 mt-2 flex-shrink-0"></span>
                                <div>
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide block mb-0.5">關鍵根源 Root Cause</span>
                                    <p className="text-sm text-neutral-300 leading-relaxed font-bold">{review.context.realImpact}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 1.5 Usage Guide (New Tool Layer) */}
                {review.usageGuide && (
                    <section className="px-6 mb-8">
                        <div className="bg-neutral-900/30 rounded-lg p-4 border border-white/5 flex gap-3 items-start">
                            <div className="bg-neutral-800 p-1.5 rounded text-neutral-400 mt-0.5">
                                <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-neutral-400 mb-2">📌 本篇適合什麼時候拿出來看？</h3>
                                <ul className="space-y-1.5">
                                    {review.usageGuide.map((guide, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                                            <CheckCircle className="w-3 h-3 text-neutral-600 mt-0.5 flex-shrink-0" />
                                            <span>{guide}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. Visual Evidence (Review Charts) - MOVED UP */}
                {(review.charts.main || review.charts.flow) && (
                    <section className="p-6 space-y-6 border-t border-b border-white/5 bg-neutral-950/30">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                                <BarChart3 className="w-4 h-4" />
                                數據復盤
                            </h2>
                            <span className="text-[10px] text-neutral-600 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded">早於新聞的鏈上真相</span>
                        </div>

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
                                    <div className="absolute top-2 left-3 pointer-events-none">
                                        <Badge variant="secondary" className="bg-black/60 text-[10px] border-white/10 backdrop-blur text-white">Price & Volatility</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-purple-400">{review.chartConfig?.symbol?.[0] || 'C'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-neutral-400">{review.chartConfig?.symbol || 'CRYPTO'}/USDT 走勢圖</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>
                                        <span className="text-[10px] font-bold text-neutral-500">加密台灣 Pro</span>
                                    </div>
                                </div>

                                {review.charts.main.interpretation ? (
                                    <div className="bg-blue-950/10 border border-blue-500/10 p-3 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-blue-400" />
                                            <span className="text-blue-400 font-bold text-xs">圖表解讀</span>
                                        </div>
                                        <div className="grid gap-3 pl-2 border-l-2 border-blue-500/20 ml-1.5 py-1">
                                            <div>
                                                <span className="text-[10px] text-blue-300/70 uppercase tracking-wider block mb-0.5">當下反應 What it means</span>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{review.charts.main.interpretation.whatItMeans}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-amber-500/70 uppercase tracking-wider block mb-0.5">未來訊號 What to watch</span>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{review.charts.main.interpretation.whatToWatch}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-blue-950/10 border border-blue-500/10 p-3 rounded-lg flex items-start gap-2">
                                        <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-blue-400 font-bold text-xs block mb-0.5">圖表解讀</span>
                                            <p className="text-xs text-neutral-300 leading-relaxed">
                                                {review.charts.main.caption.replace('圖表解讀：', '')}
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                                    <div className="absolute top-2 left-3 pointer-events-none">
                                        <Badge variant="secondary" className="bg-black/60 text-[10px] border-white/10 backdrop-blur text-white">
                                            {review.slug.includes('luna') ? 'Supply Inflation' : 'Net Flow / OI'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-purple-400">{review.chartConfig?.symbol?.[0] || 'C'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-neutral-400">{review.chartConfig?.symbol || 'CRYPTO'}/Data 資金流向</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>
                                        <span className="text-[10px] font-bold text-neutral-500">加密台灣 Pro</span>
                                    </div>
                                </div>
                                {review.charts.flow.interpretation ? (
                                    <div className="bg-green-950/10 border border-green-500/10 p-3 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400 font-bold text-xs">流動性解讀</span>
                                        </div>
                                        <div className="grid gap-3 pl-2 border-l-2 border-green-500/20 ml-1.5 py-1">
                                            <div>
                                                <span className="text-[10px] text-green-300/70 uppercase tracking-wider block mb-0.5">當下反應 What it means</span>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{review.charts.flow.interpretation.whatItMeans}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-amber-500/70 uppercase tracking-wider block mb-0.5">未來訊號 What to watch</span>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{review.charts.flow.interpretation.whatToWatch}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-950/10 border border-green-500/10 p-3 rounded-lg flex items-start gap-2">
                                        <Activity className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-green-400 font-bold text-xs block mb-0.5">流動性解讀</span>
                                            <p className="text-xs text-neutral-300 leading-relaxed">
                                                {review.charts.flow.caption.replace('圖表解讀：', '')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OI Chart (Fallback Position if not flow) */}
                        {(!review.charts.flow && review.charts.oi) && (
                            <div className="space-y-3">
                                <div className="aspect-video w-full bg-neutral-900/50 rounded-xl border border-white/5 flex items-center justify-center p-2 relative">
                                    <ReviewChart
                                        type="oi"
                                        symbol={review.chartConfig?.symbol || 'BTC'}
                                        daysBuffer={review.chartConfig?.daysBuffer}
                                        eventStart={review.eventStartAt}
                                        eventEnd={review.eventEndAt}
                                        reviewSlug={review.slug}
                                    />
                                    <div className="absolute top-2 left-3 pointer-events-none">
                                        <Badge variant="secondary" className="bg-black/60 text-[10px] border-white/10 backdrop-blur text-white">Open Interest</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-purple-400">{review.chartConfig?.symbol?.[0] || 'C'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-neutral-400">{review.chartConfig?.symbol || 'CRYPTO'}/Data 持倉數據</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>
                                        <span className="text-[10px] font-bold text-neutral-500">加密台灣 Pro</span>
                                    </div>
                                </div>
                                {review.charts.oi.interpretation ? (
                                    <div className="bg-yellow-950/10 border border-yellow-500/10 p-3 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity className="w-4 h-4 text-yellow-400" />
                                            <span className="text-yellow-400 font-bold text-xs">持倉量解讀</span>
                                        </div>
                                        <div className="grid gap-3 pl-2 border-l-2 border-yellow-500/20 ml-1.5 py-1">
                                            <div>
                                                <span className="text-[10px] text-yellow-300/70 uppercase tracking-wider block mb-0.5">當下反應 What it means</span>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{review.charts.oi.interpretation.whatItMeans}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-amber-500/70 uppercase tracking-wider block mb-0.5">未來訊號 What to watch</span>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{review.charts.oi.interpretation.whatToWatch}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-950/10 border border-yellow-500/10 p-3 rounded-lg flex items-start gap-2">
                                        <Activity className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-yellow-400 font-bold text-xs block mb-0.5">持倉量解讀</span>
                                            <p className="text-xs text-neutral-300 leading-relaxed">
                                                {review.charts.oi.caption.replace('圖表解讀：', '')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* 3. Context (The Setup) */}
                <section className="p-6 space-y-5 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        事件脈絡
                    </h2>
                    <div className="bg-neutral-900/30 rounded-xl p-5 border border-white/5 space-y-5">
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pt-1">Market Narrative</span>
                            <p className="text-sm text-neutral-400 leading-relaxed">{review.context.narrative}</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pt-1">The Reality</span>
                            <p className="text-sm text-neutral-200 leading-relaxed">{review.context.what}</p>
                        </div>
                    </div>
                </section>

                {/* 4. Market State (Condensed) */}
                <section className="p-6 space-y-4 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        市場背景
                    </h2>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <div className="bg-neutral-900/30 rounded-lg p-3 border border-white/5 min-w-[140px]">
                            <span className="text-[10px] text-neutral-500 uppercase block mb-1">Price</span>
                            <div className="text-sm font-bold text-white">{review.initialState.price}</div>
                        </div>
                        <div className="bg-neutral-900/30 rounded-lg p-3 border border-white/5 min-w-[140px]">
                            <span className="text-[10px] text-neutral-500 uppercase block mb-1">Sentiment</span>
                            <div className={cn("text-sm font-bold", review.initialState.fearGreed.includes('貪婪') ? "text-red-400" : "text-green-400")}>
                                {review.initialState.fearGreed}
                            </div>
                        </div>
                        <div className="bg-neutral-900/30 rounded-lg p-3 border border-white/5 min-w-[200px] flex-1">
                            <span className="text-[10px] text-neutral-500 uppercase block mb-1">Key Metrics</span>
                            <div className="text-xs text-neutral-300 truncate">{review.initialState.oi || review.initialState.funding}</div>
                        </div>
                    </div>
                </section>

                {/* 5. Misconceptions */}
                {review.misconceptions && (
                    <section className="p-6 space-y-4 border-b border-white/5">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <AlertOctagon className="w-4 h-4" />
                            常見誤解
                        </h2>
                        <div className="space-y-2">
                            {review.misconceptions.map((m, idx) => (
                                <div key={idx} className="bg-neutral-900/30 rounded-lg border border-white/5 p-3 flex gap-3">
                                    <XCircle className="w-4 h-4 text-red-500/50 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-neutral-400 line-through decoration-red-500/30 decoration-2">{m.myth}</p>
                                        <p className="text-sm text-neutral-200 font-medium mt-1 flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                            {m.fact}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. Timeline (Collapsible) */}
                <section className="p-6 space-y-6 border-b border-white/5 relative">
                    <div className="flex items-center justify-between z-10 relative">
                        <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                            <ListChecks className="w-4 h-4" />
                            事件時間軸
                        </h2>
                        <button
                            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                            className="text-[10px] flex items-center gap-1 text-neutral-500 hover:text-white transition-colors bg-neutral-900 border border-white/10 px-2 py-1 rounded-full"
                        >
                            {isTimelineExpanded ? (
                                <>收合 Collapse <ChevronUp className="w-3 h-3" /></>
                            ) : (
                                <>展開全部 Expand ({review.timeline.length}) <ChevronDown className="w-3 h-3" /></>
                            )}
                        </button>
                    </div>

                    {/* Continuous Line - Aligned center of 50px width is 25px. Left padding/margin needs to be accounted. */}
                    {/* The date bubble container is min-w-[50px]. So center is at 25px inside the container. */}
                    {/* The parent container has gap-4. */}
                    {/* Timeline section p-6 means left padding 24px. */}
                    {/* So absolute left should be related to the content spacing. */}
                    {/* Let's use left-[49px] to align with the center of the 50px-wide date column (which is 25px wide + 24px padding = 49px) */}
                    <div className="absolute left-[49px] top-16 bottom-6 w-px bg-neutral-800 z-0"></div>

                    <div className="space-y-8 relative z-10">
                        {review.timeline.slice(0, isTimelineExpanded ? undefined : 3).map((item, idx) => (
                            <div key={idx} className="flex gap-4 group relative">
                                {/* Date Bubble & Risk Icon */}
                                <div className="flex flex-col items-center gap-2 min-w-[50px] pt-1 z-10">
                                    <span className="text-[10px] font-mono text-neutral-500 bg-black px-1.5 py-0.5 rounded border border-white/10">
                                        {item.date.slice(5)}
                                    </span>
                                    {/* Risk Dot on Line */}
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full border-2 bg-black transition-colors relative z-20",
                                        item.riskLevel === 'high' ? "border-white bg-neutral-800" :
                                            item.riskLevel === 'medium' ? "border-neutral-500" :
                                                "border-neutral-700"
                                    )} />
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 pt-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        {item.riskLevel && (
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-wider",
                                                item.riskLevel === 'high' ? "text-white" :
                                                    item.riskLevel === 'medium' ? "text-neutral-400" :
                                                        "text-neutral-600"
                                            )}>
                                                {item.riskLevel === 'high' ? '⚠️ 系統性風險 Systemic Factor' :
                                                    item.riskLevel === 'medium' ? '⚡ 結構惡化 Structural Decay' : '風險釋放 Risk Release'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed mb-1.5 font-medium">
                                        {item.description}
                                    </p>
                                    <div className="text-[10px] text-neutral-600 flex items-center gap-1.5">
                                        <Activity className="w-3 h-3" />
                                        市場：{item.marketImpact}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isTimelineExpanded && review.timeline.length > 3 && (
                        <button
                            onClick={() => setIsTimelineExpanded(true)}
                            className="w-full mt-4 py-3 text-xs text-neutral-500 hover:text-white border-t border-white/5 bg-gradient-to-b from-transparent to-neutral-900/50 flex items-center justify-center gap-2"
                        >
                            還有 {review.timeline.length - 3} 個節點... 點擊展開
                        </button>
                    )}
                </div>
            </section>

            {/* 7. Future Signals (The Checklist Tool) */}
            <section className="p-6 space-y-5">
                <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-6">
                    <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2 uppercase tracking-wider mb-4">
                        <AlertTriangle className="w-4 h-4" />
                        未來預警訊號
                    </h2>
                    <p className="text-xs text-amber-500/60 mb-4">
                        以下訊號通常在價格崩跌前 24-72 小時出現。
                    </p>

                    <div className="space-y-3">
                        {review.actionableChecklist.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-900/30 rounded border border-white/5 group hover:bg-neutral-900/50 transition-colors">
                                <div className="mt-1 w-3 h-3 rounded-full border border-neutral-600 flex items-center justify-center group-hover:border-neutral-400 transition-colors bg-transparent">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">
                                        {item.label}
                                    </h3>
                                    <p className="text-[11px] text-neutral-500 leading-relaxed group-hover:text-neutral-400">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Historical Comparison */}
            {review.historicalComparison && (
                <section className="p-6 space-y-5 border-b border-white/5">
                    <h2 className="text-sm font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-wider">
                        <GitCompare className="w-4 h-4" />
                        歷史對照
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

            {/* Footer Quote */}
            <div className="px-6 pb-12 text-center border-t border-white/5 pt-8">
                <p className="text-[10px] text-neutral-600 font-mono italic">
                    "History doesn't repeat itself, but it often rhymes."
                </p>
            </div>

            {/* Related CTA - Learning Path Style */}
            {relatedReviews.length > 0 && (
                <section className="p-6 pt-0">
                    <div className="h-px bg-white/5 mb-6" />
                    <h3 className="text-xs font-bold text-neutral-500 mb-4 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        相關學習路徑
                    </h3>
                    <div className="space-y-3">
                        {relatedReviews.map((r, i) => (
                            <Link href={`/reviews/${r.slug}`} key={r.id}>
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-neutral-900/30 border border-white/5 hover:bg-neutral-800 transition-colors group">
                                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">{r.title.split('：')[0]}</div>
                                        <div className="text-[10px] text-neutral-600 mt-0.5">{r.title.split('：')[1] || r.summary.slice(0, 20) + '...'}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </article>
        </main >
    );
}
