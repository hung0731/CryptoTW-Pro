'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, Calendar, Lock, Share2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLiff } from '@/components/LiffProvider'
import { cn } from '@/lib/utils'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { BottomNav } from '@/components/BottomNav'

interface Article {
    id: string
    title: string
    body: string
    summary?: string
    type: string
    created_at: string
    thumbnail_url?: string
    is_public: boolean
    metadata?: any
}

export default function ArticlePage() {
    const params = useParams()
    const { isLoggedIn, dbUser, isLoading: isAuthLoading } = useLiff()
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!params.id) return
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/content?id=${params.id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                if (data.content) {
                    setArticle(data.content)
                    // Track View
                    if (dbUser?.id) {
                        fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: dbUser.id,
                                eventType: 'view_article',
                                eventName: data.content.title,
                                metadata: { article_id: data.content.id, type: data.content.type }
                            })
                        }).catch(e => console.error('Tracking Error:', e))
                    }
                } else {
                    setError('Article not found')
                }
            } catch (e) {
                setError('Error loading article')
            } finally {
                setLoading(false)
            }
        }
        if (dbUser?.id) { // Only fetch if user is ready (or maybe fetch article first then track?)
            // Actually article fetching doesn't need auth per se for public ones, but tracking does. 
            // Let's keep logic simple: fetch article regardless, track if user exists.
            fetchArticle()
        } else {
            fetchArticle()
        }
    }, [params.id, dbUser?.id])

    // Loading State
    if (loading || isAuthLoading) {
        return (
            <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto space-y-8 pt-20">
                <Skeleton className="h-4 w-20 bg-neutral-800" />
                <Skeleton className="h-12 w-3/4 bg-neutral-800" />
                <Skeleton className="h-4 w-1/2 bg-neutral-800" />
                <div className="space-y-4 pt-8">
                    <Skeleton className="h-4 w-full bg-neutral-800" />
                    <Skeleton className="h-4 w-full bg-neutral-800" />
                    <Skeleton className="h-4 w-2/3 bg-neutral-800" />
                </div>
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <p className="text-neutral-400 mb-4">{error || 'Article not found'}</p>
                <Link href="/feed">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Back to Feed</Button>
                </Link>
            </div>
        )
    }

    // Access Check
    // If article is public => Allow
    // If article is NOT public => Check if user is PRO
    const userStatus = dbUser?.membership_status as string
    const isPro = userStatus === 'pro' || userStatus === 'lifetime'
    const hasAccess = article.is_public || isPro

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/5 space-y-6">
                    <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2">PRO 會員限定</h2>
                        <p className="text-neutral-400 text-sm">此為深度分析或獨家內容，僅供 PRO 會員瀏覽。</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Link href="/feed">
                            <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5">返回</Button>
                        </Link>
                        <Link href="/profile">
                            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">升級會員</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <article className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 pb-24">
            <UnifiedHeader level="secondary" title="文章" backHref="/articles" />

            <div className="max-w-3xl mx-auto px-6 pt-4">
                {/* Header Info */}
                <header className="mb-12 space-y-6">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/20 bg-blue-400/10 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full">
                            {article.type}
                        </Badge>
                        <span className="text-neutral-500 text-xs uppercase tracking-widest flex items-center gap-1">
                            {new Date(article.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Source & Reliability */}
                    {(article.metadata as any)?.source_name && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-mono text-neutral-500">SOURCE:</span>
                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">
                                {(article.metadata as any).source_name}
                            </Badge>
                            {(article.metadata as any).source_reliability && (
                                <Badge
                                    className={cn(
                                        "text-[10px] uppercase font-bold",
                                        (article.metadata as any).source_reliability === 'high' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            (article.metadata as any).source_reliability === 'medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}
                                    variant="outline"
                                >
                                    {(article.metadata as any).source_reliability === 'high' ? 'High Trust' :
                                        (article.metadata as any).source_reliability === 'medium' ? 'Medium Trust' : 'Low Trust'}
                                </Badge>
                            )}
                        </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-white/95">
                        {article.title}
                    </h1>

                    {/* AI Key Takeaways */}
                    {(article.metadata as any)?.key_takeaways && ((article.metadata as any).key_takeaways as string[]).length > 0 && (
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 space-y-4 my-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <img src="/logo.svg" className="w-24 h-24" />
                            </div>
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm tracking-widest uppercase">
                                <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                                加密台灣 AI Highlights
                            </div>
                            <ul className="space-y-3">
                                {((article.metadata as any).key_takeaways as string[]).map((point, i) => (
                                    <li key={i} className="flex items-start gap-3 text-base text-neutral-200 leading-relaxed group">
                                        <span className="text-purple-500/50 font-mono mt-0.5 group-hover:text-purple-400 transition-colors">0{i + 1}.</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {article.summary && !((article.metadata as any)?.key_takeaways) && (
                        <div className="text-lg md:text-xl text-neutral-400 leading-relaxed font-light border-l-2 border-blue-500/50 pl-6 py-1">
                            {article.summary}
                        </div>
                    )}
                </header>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight 
                    prose-p:text-neutral-300 prose-p:leading-8 prose-p:my-6
                    prose-li:text-neutral-300
                    prose-strong:text-white prose-strong:font-semibold
                    prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-white/10
                    prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:w-full
                    prose-hr:border-white/10
                ">
                    <ReactMarkdown
                        components={{
                            // Override H1 to be smaller if it appears in body (since main title is H1)
                            h1: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-10 mb-4" {...props} />,
                        }}
                    >
                        {article.body}
                    </ReactMarkdown>
                </div>
            </div>
            <BottomNav />
        </article>
    )
}
