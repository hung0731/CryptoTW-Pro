'use client'

import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { Bell, Sparkles, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AlertsPage() {
    const [loading, setLoading] = useState(true)
    const [reports, setReports] = useState<any[]>([])

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Fetch recent reports from market-summary API (need to update API or use Supabase client)
                // For MVP, we'll try fetching the latest one first, or maybe create a new endpoint for history list
                // For now, let's just fetch the latest summary and display it
                const res = await fetch('/api/market-summary')
                const data = await res.json()
                if (data.report) {
                    setReports([data.report])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            <PageHeader title="市場快訊" showLogo={false} />

            <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
                {/* Introduction */}
                <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-neutral-800 rounded-lg">
                            <Bell className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white mb-1">異常提醒與 AI 更新</h2>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                這裡將顯示市場的重大異常波動與 AI 的日內市場解讀更新。
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-32 w-full rounded-xl bg-neutral-900" />
                        <Skeleton className="h-32 w-full rounded-xl bg-neutral-900" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-xs font-medium text-neutral-500 ml-1">今日更新</h3>

                        {reports.map((report, i) => (
                            <div key={i} className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-medium text-white">AI 市場解讀</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-500">
                                        {new Date(report.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">{report.headline || report.summary}</h4>
                                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                                    {report.metadata?.analysis || report.summary}
                                </p>
                            </div>
                        ))}

                        {reports.length === 0 && (
                            <div className="text-center py-12 text-neutral-500">
                                <p className="text-xs">尚無快訊</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
