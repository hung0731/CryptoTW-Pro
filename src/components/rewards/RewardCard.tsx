'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Gift, Clock, AlertCircle, Coins, Search, Trophy, Ticket, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    easy: { label: '簡單', color: 'text-green-400' },
    medium: { label: '中等', color: 'text-yellow-400' },
    hard: { label: '困難', color: 'text-red-400' }
};

export function RewardCard({ reward }: { reward: Reward }) {
    const typeInfo = TYPE_CONFIG[reward.reward_type] || TYPE_CONFIG.other;
    const isEndingSoon = !reward.is_ongoing && reward.end_date && new Date(reward.end_date).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // < 3 days

    const handleClaim = async () => {
        try {
            await fetch(`/api/rewards/${reward.id}/claim`, { method: 'POST' });
        } catch (e) {
            // Ignore error
        }
    };

    return (
        <div className="group relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden hover:border-[#333] transition-all">
            {/* Header Badge */}
            <div className="absolute top-3 right-3 flex gap-2">
                {reward.is_featured && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        精選
                    </span>
                )}
            </div>

            <div className="p-5">
                {/* Source & Type */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                        {/* Fallback avatar if no logo */}
                        <span className="text-[10px] font-bold text-neutral-400">{reward.source_name[0]}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{reward.source_name}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded border ml-auto", typeInfo.bg, typeInfo.color)}>
                        {typeInfo.label}
                    </span>
                </div>

                {/* Title & Value */}
                <div className="mb-4">
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {reward.title}
                    </h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                        {reward.reward_value}
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-5 text-xs text-neutral-400">
                    {reward.requirements && (
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{reward.requirements}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Clock className={cn("w-3.5 h-3.5", isEndingSoon ? "text-red-400" : "")} />
                            <span className={cn(isEndingSoon ? "text-red-400 font-bold" : "")}>
                                {reward.is_ongoing ? '長期有效' : (reward.end_date ? new Date(reward.end_date).toLocaleDateString() + ' 截止' : '未定')}
                            </span>
                        </div>
                        {reward.difficulty && (
                            <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-neutral-500">難度:</span>
                                <span className={DIFFICULTY_CONFIG[reward.difficulty].color}>
                                    {DIFFICULTY_CONFIG[reward.difficulty].label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action */}
                <Button
                    asChild
                    className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-white/10 justify-between group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all"
                    onClick={handleClaim}
                >
                    <Link href={reward.action_url} target="_blank">
                        <span>{reward.action_label}</span>
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                </Button>

                <div className="mt-3 text-[10px] text-center text-neutral-600">
                    {reward.claim_count > 0 ? `${reward.claim_count} 人已參加` : '快來成為第一位參加者！'}
                </div>
            </div>

            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
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
