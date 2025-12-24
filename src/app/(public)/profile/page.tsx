'use client'

import React from 'react'
import { useLiff } from '@/components/LiffProvider'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    User, LogOut, Bell, Link2, Crown, HelpCircle, ChevronRight,
    Bookmark, Settings, Shield
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { UniversalCard, CardContent } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'

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
    // Content wrapped for UniversalCard list item style
    const content = (
        <div className="flex items-center justify-between p-4 group-hover:bg-[#0E0E0F] transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <span className={cn(TYPOGRAPHY.bodyLarge, "font-medium text-white")}>{label}</span>
                {badge && (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">{badge}</span>
                )}
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
        </div>
    )

    if (external) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="block group">{content}</a>
    }
    return <Link href={href} className="block group">{content}</Link>
}

export default function ProfilePage() {
    const { isLoggedIn, profile, dbUser, isLoading: authLoading, liffObject } = useLiff()

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
        const handleLogin = () => {
            if (liffObject) {
                liffObject.login()
            }
        }

        return (
            <div className="min-h-screen bg-black p-4 flex items-center justify-center font-sans">
                <div className="w-full max-w-sm space-y-6 text-center">
                    <UniversalCard variant="default" size="L" className="bg-[#0A0A0A]">
                        <div className="space-y-4 py-4">
                            <div className="bg-neutral-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                                <User className="h-10 w-10 text-neutral-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">歡迎回來</h2>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    登入後即可查看個人帳務、<br />綁定交易所並解鎖專屬指標。
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6">
                            <Button
                                onClick={handleLogin}
                                className="w-full h-12 rounded-xl bg-[#06C755] hover:bg-[#05B34C] text-white border-none font-bold"
                            >
                                使用 LINE 快速登入
                            </Button>
                            <Link href="/" className="block">
                                <Button variant="ghost" className="w-full h-12 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5">
                                    回到首頁
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-6 border-t border-white/5 mt-6">
                            <p className="text-[10px] text-neutral-600">
                                登入即代表您同意本站之服務條款與隱私權政策。
                            </p>
                        </div>
                    </UniversalCard>
                </div>
            </div>
        )
    }

    const getMembershipBadge = () => {
        switch (dbUser?.membership_status) {
            case 'pro':
            case 'lifetime':
                return (
                    <Badge className="bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border-[#2A2A2A] backdrop-blur-md px-2 py-0.5 text-xs">
                        PRO 會員
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs">
                        審核中
                    </Badge>
                )
            default:
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
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            <PageHeader title="個人檔案" showLogo={false} backHref="/" backLabel="返回" />

            <div className={cn("pt-6 max-w-lg mx-auto", SPACING.pageX, SPACING.classes.gapCards)}>
                {/* Profile Card */}
                <UniversalCard variant="default" size="M" className="p-0 overflow-hidden">
                    <div className="flex items-center gap-4 p-5">
                        <Avatar className="h-16 w-16 ring-2 ring-white/10 shadow-lg">
                            <AvatarImage src={profile?.pictureUrl} />
                            <AvatarFallback><User className="h-8 w-8 text-neutral-500" /></AvatarFallback>
                        </Avatar>

                        <div className="space-y-1.5 flex-1">
                            <h2 className="text-xl font-bold text-white tracking-tight">{profile?.displayName}</h2>
                            <div className="flex items-center gap-2">
                                {getMembershipBadge()}
                                {(dbUser?.membership_status === 'pro' || dbUser?.membership_status === 'lifetime') && (
                                    <span className="text-[10px] text-neutral-500">
                                        已解鎖全部功能
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </UniversalCard>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <SectionHeaderCard title="設定" />
                    <UniversalCard variant="default" size="M" className="p-0 overflow-hidden divide-y divide-white/5">
                        <MenuLink icon={Bell} label="通知設定" href="/profile/notifications" />
                        <MenuLink icon={Link2} label="交易所綁定" href="/profile/bindings" />
                        <MenuLink icon={Crown} label="VIP 計劃" href="/join" />
                    </UniversalCard>
                </div>

                {/* More */}
                <div className="space-y-3">
                    <SectionHeaderCard title="更多" />
                    <UniversalCard variant="default" size="M" className="p-0 overflow-hidden divide-y divide-white/5">
                        <MenuLink icon={Bookmark} label="我的收藏" href="/bookmarks" badge="即將推出" />
                        <MenuLink icon={HelpCircle} label="幫助中心" href="https://line.me/R/ti/p/@cryptotw" external />
                    </UniversalCard>
                </div>

                {/* Logout */}
                <div>
                    <Button
                        variant="outline"
                        className="w-full border-white/10 bg-neutral-900/50 text-neutral-400 hover:bg-white/5 hover:text-neutral-300 rounded-xl py-6"
                        onClick={() => {
                            window.location.href = '/'
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        登出
                    </Button>
                </div>

                {/* Version */}
                <div className="text-center pt-2">
                    <p className="text-[10px] text-neutral-600 font-mono">加密台灣 Pro v2.0</p>
                </div>

            </div>
        </div>
    )
}
