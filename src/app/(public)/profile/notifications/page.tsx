'use client'

import React from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Bell, Zap, Gift, Newspaper, Skull, TrendingUp, Calendar, HelpCircle } from 'lucide-react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { BottomNav } from '@/components/BottomNav'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'

function NotificationToggle({
    icon: Icon,
    label,
    desc,
    checked,
    onToggle,
    isNew,
    helpTooltip
}: {
    icon: any,
    label: string,
    desc: string,
    checked: boolean,
    onToggle: () => void,
    isNew?: boolean,
    helpTooltip?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="space-y-0.5">
                    <div className="font-medium text-white flex items-center gap-2">
                        {label}
                        {helpTooltip}
                        {isNew && (
                            <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">NEW</span>
                        )}
                    </div>
                    <div className="text-xs text-neutral-500">{desc}</div>
                </div>
            </div>
            <div
                onClick={onToggle}
                className={`w-11 h-6 rounded-full flex items-center transition-colors cursor-pointer px-0.5 ${checked ? 'bg-white' : 'bg-neutral-700'}`}
            >
                <div className={`w-5 h-5 bg-black rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-[20px]' : ''}`} />
            </div>
        </div>
    )
}

export default function NotificationsPage() {
    const { profile, dbUser, isLoading: authLoading } = useLiff()

    const handleToggle = async (key: string) => {
        if (!dbUser || !profile) return

        const currentSettings = dbUser.notification_preferences || {
            market_signals: true,
            airdrops: true,
            news: true,
            whale_alerts: false,
            liquidation_alerts: false,
            funding_rate_alerts: false,
            calendar_alerts: false
        }

        const newSettings = {
            ...currentSettings,
            [key]: !currentSettings[key as keyof typeof currentSettings]
        }

        try {
            await fetch('/api/user/settings', {
                method: 'POST',
                body: JSON.stringify({
                    lineUserId: profile.userId,
                    settings: newSettings
                })
            })
            window.location.reload()
        } catch (e) {
            console.error(e)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black p-4">
                <Skeleton className="h-14 w-full rounded-xl mb-4" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    const prefs: any = dbUser?.notification_preferences || {}

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header with Back Button */}
            <UnifiedHeader
                level="secondary"
                title="通知設定"
                backHref="/profile"
                leftIcon={<Bell className="w-4 h-4 text-neutral-400" />}
            />

            <div className="px-4 py-6 max-w-lg mx-auto space-y-6">

                {/* Core Notifications */}
                <section>
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">核心通知</h2>
                    <Card className="border border-white/5 shadow-sm bg-neutral-900/50">
                        <CardContent className="p-0 divide-y divide-white/5">
                            <NotificationToggle
                                icon={Zap}
                                label="關鍵交易信號"
                                desc="接收高勝率買賣點位通知"
                                checked={prefs.market_signals ?? true}
                                onToggle={() => handleToggle('market_signals')}
                            />
                            <NotificationToggle
                                icon={Gift}
                                label="精選空投機會"
                                desc="即時獲取代幣空投活動資訊"
                                checked={prefs.airdrops ?? true}
                                onToggle={() => handleToggle('airdrops')}
                            />
                            <NotificationToggle
                                icon={Newspaper}
                                label="市場快訊"
                                desc="每日重點新聞與市場動向"
                                checked={prefs.news ?? true}
                                onToggle={() => handleToggle('news')}
                            />
                        </CardContent>
                    </Card>
                </section>

                {/* Pro Notifications */}
                <section>
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">Pro 專屬通知</h2>
                    <Card className="border border-white/5 shadow-sm bg-neutral-900/50">
                        <CardContent className="p-0 divide-y divide-white/5">
                            <NotificationToggle
                                icon={TrendingUp}
                                label="巨鯨警報"
                                desc="頂尖交易者開倉/平倉通知"
                                checked={prefs.whale_alerts ?? false}
                                onToggle={() => handleToggle('whale_alerts')}
                                isNew
                            />
                            <NotificationToggle
                                icon={Skull}
                                label="清算通知"
                                desc="大額清算事件即時推播"
                                checked={prefs.liquidation_alerts ?? false}
                                onToggle={() => handleToggle('liquidation_alerts')}
                                isNew
                                helpTooltip={
                                    <ExplainTooltip
                                        term={INDICATOR_KNOWLEDGE.liquidation.term}
                                        definition={INDICATOR_KNOWLEDGE.liquidation.definition}
                                        explanation={INDICATOR_KNOWLEDGE.liquidation.interpretation}
                                        timeline={INDICATOR_KNOWLEDGE.liquidation.timeline}
                                    />
                                }
                            />
                            <NotificationToggle
                                icon={TrendingUp}
                                label="資金費率異常"
                                desc="資金費率極端時推播"
                                checked={prefs.funding_rate_alerts ?? false}
                                onToggle={() => handleToggle('funding_rate_alerts')}
                                isNew
                                helpTooltip={
                                    <ExplainTooltip
                                        term={INDICATOR_KNOWLEDGE.fundingRate.term}
                                        definition={INDICATOR_KNOWLEDGE.fundingRate.definition}
                                        explanation={INDICATOR_KNOWLEDGE.fundingRate.interpretation}
                                        timeline={INDICATOR_KNOWLEDGE.fundingRate.timeline}
                                    />
                                }
                            />
                            <NotificationToggle
                                icon={Calendar}
                                label="財經事件提醒"
                                desc="重要財經事件前 30 分鐘通知"
                                checked={prefs.calendar_alerts ?? false}
                                onToggle={() => handleToggle('calendar_alerts')}
                                isNew
                            />
                        </CardContent>
                    </Card>
                </section>

                {/* Quiet Hours */}
                <section>
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">靜音時段</h2>
                    <Card className="border border-white/5 shadow-sm bg-neutral-900/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium text-white">勿擾模式</div>
                                    <div className="text-xs text-neutral-500">22:00 - 08:00 不推播通知</div>
                                </div>
                                <div className="text-xs text-neutral-600">即將推出</div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

            </div>

            <BottomNav />
        </div>
    )
}
