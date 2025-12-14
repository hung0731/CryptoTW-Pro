'use client'

import React from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    User, LogOut, Bell, Link2, Crown, HelpCircle, ChevronRight,
    Bookmark, Settings, Shield
} from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { PageHeader } from '@/components/PageHeader'

function MenuLink({
    icon: Icon,
    label,
    href,
    badge,
    external
}: {
    icon: any,
    label: string,
    href: string,
    badge?: string,
    external?: boolean
}) {
    const content = (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-xl">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-400" />
                </div>
                <span className="text-sm font-medium text-white">{label}</span>
                {badge && (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
        </div>
    )

    if (external) {
        return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
    }
    return <Link href={href}>{content}</Link>
}

export default function ProfilePage() {
    const { isLoggedIn, profile, dbUser, isLoading: authLoading } = useLiff()

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black p-4">
                <Skeleton className="h-14 w-full rounded-xl mb-4" />
                <Skeleton className="h-24 w-full rounded-xl mb-4" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        )
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black p-4 flex items-center justify-center">
                <div className="text-center p-8 bg-neutral-900 border-white/5 border rounded-2xl shadow-lg max-w-sm">
                    <div className="bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="mb-6 text-neutral-400 font-medium">請登入以查看個人檔案。</p>
                    <Link href="/">
                        <Button className="w-full rounded-full bg-white text-black hover:bg-neutral-200">回到首頁</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const getMembershipBadge = () => {
        switch (dbUser?.membership_status) {
            case 'pro':
            case 'lifetime':
                return (
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md transition-colors px-2 py-0.5 text-xs">
                        PRO 會員
                    </Badge>
                )
            default:
                // Handle 'vip' and other cases
                if ((dbUser?.membership_status as string) === 'vip') {
                    return (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 text-xs">
                            VIP
                        </Badge>
                    )
                }
                return (
                    <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 border border-white/5 px-2 py-0.5 text-xs">
                        免費會員
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs">
                        審核中
                    </Badge>
                )
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            <PageHeader showLogo />

            <div className="px-4 py-6 max-w-lg mx-auto space-y-5">

                {/* Profile Card */}
                <section>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-white/5">
                        <Avatar className="h-16 w-16 ring-2 ring-white/10 shadow-lg">
                            <AvatarImage src={profile?.pictureUrl} />
                            <AvatarFallback><User className="h-8 w-8 text-neutral-500" /></AvatarFallback>
                        </Avatar>

                        <div className="space-y-1.5 flex-1">
                            <h2 className="text-xl font-bold text-white tracking-tight">{profile?.displayName}</h2>
                            {getMembershipBadge()}
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">設定</h2>
                    <div className="bg-neutral-900/50 rounded-2xl border border-white/5 divide-y divide-white/5">
                        <MenuLink icon={Bell} label="通知設定" href="/profile/notifications" />
                        <MenuLink icon={Link2} label="交易所綁定" href="/profile/bindings" />
                        <MenuLink icon={Crown} label="VIP 計劃" href="/join" />
                    </div>
                </section>

                {/* More */}
                <section>
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">更多</h2>
                    <div className="bg-neutral-900/50 rounded-2xl border border-white/5 divide-y divide-white/5">
                        <MenuLink icon={Bookmark} label="我的收藏" href="/bookmarks" badge="即將推出" />
                        <MenuLink icon={HelpCircle} label="幫助中心" href="https://line.me/R/ti/p/@cryptotw" external />
                    </div>
                </section>

                {/* Logout */}
                <section>
                    <Button
                        variant="outline"
                        className="w-full border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl py-6"
                        onClick={() => {
                            window.location.href = '/'
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        登出
                    </Button>
                </section>

                {/* Version */}
                <div className="text-center pt-4">
                    <p className="text-[10px] text-neutral-600">加密台灣 Pro v2.0</p>
                </div>

            </div>

            <BottomNav />
        </div>
    )
}
