'use client'

import { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

export default function ArticlesPage() {
  const { profile, isLoading: isAuthLoading } = useLiff()
  const [activities, setActivities] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Fetch Data - No restrictions for testing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, contRes] = await Promise.all([
          fetch('/api/activities').then(r => r.json()),
          fetch('/api/content').then(r => r.json())
        ])
        if (actRes.activities) setActivities(actRes.activities)
        if (contRes.content) setContent(contRes.content)
      } catch (e) {
        console.error(e)
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  // Loading State
  if (isAuthLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-black p-4 space-y-8">
        <div className="flex items-center justify-center p-4">
          <img src="/logo.svg" className="h-6 w-auto opacity-50 animate-pulse" />
        </div>
        <Skeleton className="h-12 w-full bg-neutral-900" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 bg-neutral-900" />
          <Skeleton className="h-8 w-16 bg-neutral-900" />
          <Skeleton className="h-8 w-16 bg-neutral-900" />
        </div>
        <Skeleton className="h-40 w-full bg-neutral-900" />
      </div>
    )
  }

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'news', label: '快訊' },
    { id: 'alpha', label: '深度 / 原創' },
    { id: 'weekly', label: '週報' },
  ]

  const filteredContent = activeTab === 'all'
    ? content
    : content.filter(c => c.type === activeTab)

  return (
    <main className="min-h-screen font-sans bg-black text-white pb-24">

      {/* Header */}
      <PageHeader showLogo />

      {/* Category Filter Pills (Scrollable) */}
      <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-full overflow-x-auto no-scrollbar px-4 py-3 max-w-lg mx-auto">
          <div className="flex space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === cat.id
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 space-y-8 max-w-lg mx-auto min-h-screen">

        {/* Always show activities unless specific tab logic requires hiding (Usually kept on top) */}
        <MarketActivities activities={activities} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">最新內容</h2>
          </div>
          <ContentList items={filteredContent} />
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

function MarketActivities({ activities }: { activities: any[] }) {
  if (activities.length === 0) return null
  return (
    <section className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">交易信號</h2>
        <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">即時</Badge>
      </div>
      <div className="space-y-3">
        {activities.map((act) => (
          <Link href={`/events/${act.id}`} key={act.id}>
            <Card className="bg-neutral-900 border-white/5 overflow-hidden group hover:border-white/10 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${act.is_active ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">{act.title}</h3>
                    <span className="text-[10px] text-neutral-500 font-mono uppercase bg-black px-2 py-0.5 rounded border border-white/5">{act.exchange_name}</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{act.description}</p>
                  <div className="flex items-center text-[10px] text-neutral-500 mt-2 font-medium">
                    <span className="group-hover:text-neutral-300">查看詳情</span>
                    <ChevronRight className="w-3 h-3 ml-0.5 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ContentList({ items }: { items: any[] }) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-neutral-900/50">
        <p className="text-neutral-500 text-sm">暫無內容</p>
      </div>
    )
  }
  return (
    <div className="bg-neutral-900/50 rounded-lg border border-white/5 divide-y divide-white/5">
      {items.map((item) => (
        <Link href={`/content/${item.id}`} key={item.id} className="block group">
          <div className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors">
            {/* Thumbnail */}
            {item.thumbnail_url && (
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-neutral-800 border border-white/10">
                <img src={item.thumbnail_url} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                {!item.is_public && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-yellow-500 drop-shadow-md" />
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 text-neutral-400 font-normal">
                  {item.type?.toUpperCase() || 'ARTICLE'}
                </Badge>
                {/* Date */}
                <span className="text-[10px] text-neutral-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed opacity-70">
                {item.summary || item.content?.substring(0, 100)}...
              </p>
            </div>

            {/* Arrow */}
            <div className="self-center shrink-0 opacity-0 group-hover:opacity-50 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
