'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Gift, Clock, AlertCircle, Coins, Search, Trophy, Ticket, Share2, CheckCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UniversalCard, CardContent } from '@/components/ui/UniversalCard';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { useToast } from '@/hooks/use-toast';

export interface Reward {
    id: string;
    title: string;
    slug: string;
    description: string;
    reward_type: 'exchange_promo' | 'raffle' | 'airdrop' | 'learn_earn' | 'referral' | 'other';
    source: 'cryptotw' | 'exchange' | 'project' | 'other';
    source_name: string;
    source_logo_url?: string;
    start_date: string;
    end_date?: string;
    is_ongoing: boolean;
    reward_value?: string;
    requirements?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    action_url: string;
    action_label: string;
    is_featured: boolean;
    claim_count: number;
}

const TYPE_CONFIG = {
    exchange_promo: { label: '交易所福利', icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    raffle: { label: '抽獎活動', icon: Ticket, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    airdrop: { label: '空投領取', icon: Gift, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    learn_earn: { label: '學習獎勵', icon: Search, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    referral: { label: '推薦碼', icon: Share2, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    other: { label: '其他', icon: Gift, color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/20' }
};

const DIFFICULTY_CONFIG = {
    easy: { label: '簡單', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    medium: { label: '中等', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    hard: { label: '困難', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
};

interface RewardCardProps {
    reward: Reward;
    initialClaimed?: boolean;
}

export function RewardCard({ reward, initialClaimed = false }: RewardCardProps) {
    const typeInfo = TYPE_CONFIG[reward.reward_type] || TYPE_CONFIG.other;
    const [isClaimed, setIsClaimed] = useState(initialClaimed);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Check if ending soon (less than 3 days)
    const isEndingSoon = !reward.is_ongoing && reward.end_date && new Date(reward.end_date).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
    const showTimer = isEndingSoon && new Date(reward.end_date!).getTime() > Date.now();

    const handleClaim = async () => {
        if (isClaimed) return; // Prevent re-click

        setLoading(true);
        try {
            // 1. Record claim in backend
            const res = await fetch('/api/user/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rewardId: reward.id, status: 'claimed' })
            });

            if (res.ok) {
                setIsClaimed(true);
                toast({ title: '已標記為參加', description: '我們會持續追蹤此福利狀態' });
            } else if (res.status === 401) {
                // Not logged in, but we still open the link
                // Maybe prompt login? For now just allow proceed.
            }

            // 2. Increment global counter (legacy API)
            try {
                fetch(`/api/rewards/${reward.id}/claim`, { method: 'POST' });
            } catch (e) { }

        } catch (e) {
            console.error('Claim error', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UniversalCard
            variant={isClaimed ? "subtle" : "clickable"}
            className={cn("group transition-all duration-300", isClaimed && "opacity-75")}
        >
            {/* Header Badge */}
            <div className="absolute top-3 right-3 flex gap-2 z-10 pointer-events-none">
                {isClaimed && (
                    <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-green-900/20">
                        <Check className="w-3 h-3" strokeWidth={3} />
                        已參加
                    </span>
                )}
                {reward.is_featured && !isClaimed && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1 backdrop-blur-sm">
                        <Trophy className="w-3 h-3" />
                        精選
                    </span>
                )}
            </div>

            <CardContent className="h-full flex flex-col pt-5">
                {/* Source & Type */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                        {reward.source_logo_url ? (
                            <img src={reward.source_logo_url} alt={reward.source_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-bold text-neutral-400">{reward.source_name[0]}</span>
                        )}
                    </div>
                    <span className="text-xs text-neutral-400 truncate">{reward.source_name}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded border ml-auto shrink-0", typeInfo.bg, typeInfo.color)}>
                        {typeInfo.label}
                    </span>
                </div>

                {/* Title & Value */}
                <div className="mb-4 flex-1">
                    <h3 className={cn(
                        "text-base font-bold mb-1 transition-colors line-clamp-2 min-h-[3rem]",
                        isClaimed ? "text-neutral-400" : "text-white group-hover:text-blue-400"
                    )}>
                        {reward.title}
                    </h3>
                    <p className={cn(
                        "text-2xl font-bold bg-clip-text text-transparent truncate",
                        isClaimed ? "bg-gradient-to-r from-neutral-500 to-neutral-600" : "bg-gradient-to-r from-yellow-200 to-yellow-500"
                    )}>
                        {reward.reward_value}
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-5 text-xs text-neutral-400">
                    {reward.requirements && (
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{reward.requirements}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Clock className={cn("w-3.5 h-3.5", showTimer ? "text-neutral-300" : "")} />
                            {showTimer ? (
                                <CountdownTimer targetDate={reward.end_date!} className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10" />
                            ) : (
                                <span>
                                    {reward.is_ongoing ? '長期有效' : (reward.end_date ? new Date(reward.end_date).toLocaleDateString() + ' 截止' : '未定')}
                                </span>
                            )}
                        </div>

                        {/* Difficulty Badge */}
                        <div className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] border",
                            DIFFICULTY_CONFIG[reward.difficulty!].bg,
                            DIFFICULTY_CONFIG[reward.difficulty!].color
                        )}>
                            {DIFFICULTY_CONFIG[reward.difficulty!].label}
                        </div>
                    </div>
                </div>

                {/* Footer / Action */}
                <div className="mt-auto pt-3 border-t border-white/5 flex gap-2">
                    <Button
                        disabled={loading || isClaimed}
                        onClick={(e) => {
                            e.stopPropagation(); // prevent card click
                            handleClaim();
                            if (!isClaimed) window.open(reward.action_url, '_blank');
                        }}
                        className={cn(
                            "flex-1 h-9 text-xs font-bold transition-all",
                            isClaimed
                                ? "bg-transparent border border-green-500/30 text-green-500 cursor-default hover:bg-transparent"
                                : "bg-white text-black hover:bg-neutral-200"
                        )}
                    >
                        {loading && <div className="mr-2 animate-spin rounded-full h-3 w-3 border-b-2 border-black" />}
                        {isClaimed ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                已參加
                            </>
                        ) : (
                            <>
                                {reward.action_label || '立即領取'}
                                <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>

            {/* Top Border Gradient - Optional enhancement, can remove if clean style preferred */}
            {!isClaimed && (
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </UniversalCard>
    );
}

export function RewardCardSkeleton() {
    return (
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A]" />
                <div className="w-20 h-4 bg-[#1A1A1A] rounded" />
                <div className="ml-auto w-16 h-5 bg-[#1A1A1A] rounded" />
            </div>
            <div className="space-y-2 mb-4">
                <div className="w-full h-6 bg-[#1A1A1A] rounded" />
                <div className="w-2/3 h-8 bg-[#1A1A1A] rounded" />
            </div>
            <div className="space-y-2 mb-5">
                <div className="w-full h-4 bg-[#1A1A1A] rounded" />
                <div className="w-full h-4 bg-[#1A1A1A] rounded" />
            </div>
            <div className="w-full h-10 bg-[#1A1A1A] rounded" />
        </div>
    );
}
