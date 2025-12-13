'use client'

import { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Filter } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { ArticleGrid } from '@/components/news/ArticleGrid'
import { Button } from '@/components/ui/button'

export default function ArticlesPage() {
  const { profile, isLoading: isAuthLoading } = useLiff()
  const [activities, setActivities] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [coinglassNews, setCoinglassNews] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'flash' | 'insights' | 'events'>('flash')
  const [refreshing, setRefreshing] = useState(false)
  const [importantOnly, setImportantOnly] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [actRes, contRes, newsRes] = await Promise.all([
        fetch('/api/activities').then(r => r.json()),
        fetch('/api/content').then(r => r.json()),
        fetch('/api/coinglass/news').then(r => r.json())
      ])

      if (actRes.activities) setActivities(actRes.activities)
      if (contRes.content) setContent(contRes.content)

      // Process Coinglass News
      if (newsRes.news) {
        const externalNews = newsRes.news.map((item: any) => ({
          id: `cg-${Math.random().toString(36).substr(2, 9)}`,
          title: item.article_title,
          content: item.article_content,
          summary: item.article_description || item.article_content?.substring(0, 100),
          thumbnail_url: item.article_picture,
          type: 'news',
          created_at: item.article_release_time,
          url: null,
          is_public: true,
          source: item.source_name || 'Coinglass',
          important: false // API might not give this, could try to infer from keywords
        }))
        setCoinglassNews(externalNews)
      }
      setLastUpdated(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setDataLoading(false)
      setRefreshing(false)
    }
  }

  // Initial Fetch & Auto Refresh for Flash News
  useEffect(() => {
    fetchData()

    // Auto refresh every 60s if on flash tab
    const interval = setInterval(() => {
      if (activeTab === 'flash') {
        fetchData()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [activeTab])

  // Loading State
  if (isAuthLoading || (dataLoading && !coinglassNews.length)) {
    return (
      <div className="min-h-screen bg-black p-4 space-y-8 pb-24">
        <PageHeader showLogo />
        <div className="space-y-4 px-4">
          <Skeleton className="h-8 w-full bg-neutral-900" />
          <Skeleton className="h-40 w-full bg-neutral-900" />
          <Skeleton className="h-20 w-full bg-neutral-900" />
          <Skeleton className="h-20 w-full bg-neutral-900" />
        </div>
        <BottomNav />
      </div>
    )
  }

  // Filter Data
  const flashNewsItems = importantOnly
    ? coinglassNews.filter(n => n.important)
    : coinglassNews

  // Insights: Content typed 'alpha', 'weekly', or generic 'article' excluding pure news if mixed
  const insightItems = content

  return (
    <main className="min-h-screen font-sans bg-black text-white pb-24">

      {/* Header */}
      <PageHeader showLogo />

      {/* Sticky Tab & Controls */}
      <div className="sticky top-14 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5 pt-2 pb-0">
        <div className="flex items-center justify-between px-4 pb-2">

          {/* Tabs */}
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('flash')}
              className={cn(
                "relative py-3 text-sm font-bold transition-colors",
                activeTab === 'flash' ? "text-white" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              7x24 快訊
              {activeTab === 'flash' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={cn(
                "relative py-3 text-sm font-bold transition-colors",
                activeTab === 'insights' ? "text-white" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              深度觀點
              {activeTab === 'insights' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'flash' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImportantOnly(!importantOnly)}
                className={cn(
                  "h-7 px-2 text-[10px] rounded-full border transition-all",
                  importantOnly
                    ? "bg-red-500/10 border-red-500/50 text-red-400"
                    : "bg-neutral-900 border-white/10 text-neutral-500"
                )}
              >
                <Filter className="w-3 h-3 mr-1" />
                重點
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              className={cn("h-7 w-7 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800", refreshing && "animate-spin")}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 min-h-screen">
        {activeTab === 'flash' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-4 flex items-center justify-between text-[10px] text-neutral-600 px-2">
              <span>最後更新: {lastUpdated.toLocaleTimeString()}</span>
              <span>共 {flashNewsItems.length} 條消息</span>
            </div>
            <FlashNewsFeed items={flashNewsItems} />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-lg mx-auto pt-2">
            <ArticleGrid items={insightItems} />
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
