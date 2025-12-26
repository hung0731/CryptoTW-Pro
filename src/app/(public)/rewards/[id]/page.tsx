'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Gift, Clock, AlertCircle, CheckCircle, ExternalLink,
    ChevronLeft, Share2, Copy, Twitter, MessageCircle, FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CARDS, BUTTONS, TYPOGRAPHY, BADGES } from '@/lib/design-tokens';

interface Reward {
    id: string;
    title: string;
    description: string;
    type: 'exchange_promo' | 'raffle' | 'airdrop' | 'learn_earn' | 'other';
    cost: number;
    cost_type: 'points' | 'usdt' | 'free';
    image_url?: string;
    expiry_date?: string;
    total_quantity?: number;
    claimed_quantity?: number;
    claim_instructions?: string;
    terms_conditions?: string;
    action_url?: string;
    is_featured?: boolean;
    source_name?: string;
}

const REWARD_TYPE_LABELS: Record<string, string> = {
    exchange_promo: '交易所福利',
    raffle: '抽獎活動',
    airdrop: '空投領取',
    learn_earn: '學習獎勵',
    other: '其他福利'
};

export default function RewardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params?.id as string;

    const [reward, setReward] = useState<Reward | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReward = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/rewards/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReward(data.reward);
                } else {
                    console.error('Reward not found');
                }
            } catch (e) {
                console.error('Failed to fetch reward:', e);
            } finally {
                setLoading(false);
            }
        };
        void fetchReward();
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: '連結已複製', description: '您現在可以分享此福利連結' });
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#666666]">載入中...</div>;
    if (!reward) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#666666]">找不到福利</div>;

    const remaining = (reward.total_quantity || 0) - (reward.claimed_quantity || 0);
    const isExpired = reward.expiry_date ? new Date(reward.expiry_date) < new Date() : false;

    return (
        <MobileOptimizedLayout className="bg-[#050505] min-h-screen pb-24">

            {/* Top Navigation */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-[#1A1A1A] px-4 h-14 flex items-center justify-between">
                <button onClick={() => router.push('/rewards')} className="flex items-center gap-1 text-[#A0A0A0] hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">福利中心</span>
                </button>
                <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{reward.title}</h1>
                <div className="w-8" />
            </div>

            <div className="p-4 space-y-4">

                {/* Main Card */}
                <div className={CARDS.primary}>
                    <div className="space-y-6">
                        {/* Tags */}
                        <div className="flex items-center gap-2">
                            <span className={BADGES.neutral}>
                                {REWARD_TYPE_LABELS[reward.type] || '福利'}
                            </span>
                            {reward.cost_type === 'free' ? (
                                <span className={BADGES.success}>
                                    免費領取
                                </span>
                            ) : (
                                <span className={BADGES.neutral}>
                                    {reward.cost} {reward.cost_type === 'points' ? '積分' : 'USDT'}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className={TYPOGRAPHY.pageTitle}>
                            {reward.title}
                        </h1>

                        {/* Metadata */}
                        <div className="space-y-4">
                            {/* Source/Host */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                    <Gift className="w-5 h-5 text-[#A0A0A0]" />
                                </div>
                                <div>
                                    <p className={TYPOGRAPHY.cardTitle}>提供方：{reward.source_name || 'CryptoTW'}</p>
                                    <p className={TYPOGRAPHY.cardSubtitle}>信譽良好合作夥伴</p>
                                </div>
                            </div>

                            {/* Expiry */}
                            {reward.expiry_date && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-[#A0A0A0]" />
                                    </div>
                                    <div>
                                        <p className={TYPOGRAPHY.cardTitle}>截止日期</p>
                                        <p className={cn(TYPOGRAPHY.cardSubtitle, isExpired && "text-red-500")}>
                                            {new Date(reward.expiry_date).toLocaleDateString()}
                                            {isExpired && ' (已結束)'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            {typeof reward.total_quantity === 'number' && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-5 h-5 text-[#A0A0A0]" />
                                    </div>
                                    <div>
                                        <p className={TYPOGRAPHY.cardTitle}>剩餘名額</p>
                                        <p className={TYPOGRAPHY.cardSubtitle}>
                                            {remaining} / {reward.total_quantity}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Primary Action */}
                        <Button
                            className={cn(
                                "w-full h-12 rounded-lg font-medium transition-colors",
                                isExpired
                                    ? "bg-[#141414] text-[#666666] border border-[#1A1A1A] cursor-not-allowed"
                                    : "bg-white text-black hover:bg-[#E0E0E0]"
                            )}
                            onClick={() => reward.action_url && window.open(reward.action_url, '_blank')}
                            disabled={isExpired}
                        >
                            {isExpired ? '活動已結束' : '立即兌換'}
                            {!isExpired && <ExternalLink className="w-4 h-4 ml-1 opacity-50" />}
                        </Button>

                        {/* Share Row */}
                        <div className="pt-2 border-t border-[#1A1A1A] mt-4">
                            <div className="flex items-center justify-between">
                                <p className={TYPOGRAPHY.caption}>分享此福利</p>
                                <div className="flex items-center gap-3">
                                    <button onClick={handleCopyLink} className={BUTTONS.icon + " group"}>
                                        <Copy className="w-4 h-4 text-[#A0A0A0] group-hover:text-white transition-colors" />
                                    </button>
                                    <button className={BUTTONS.icon + " group"}>
                                        <Share2 className="w-4 h-4 text-[#A0A0A0] group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                <div className={CARDS.primary}>
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-5 h-5 text-[#A0A0A0]" />
                        <h2 className={TYPOGRAPHY.sectionTitle}>福利詳情</h2>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-[#A0A0A0] leading-relaxed">
                        <ReactMarkdown>{reward.description || '暫無詳細說明'}</ReactMarkdown>
                    </div>
                </div>

                {/* Instructions Card */}
                {reward.claim_instructions && (
                    <div className={CARDS.primary}>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-[#A0A0A0]" />
                            <h2 className={TYPOGRAPHY.sectionTitle}>兌換說明</h2>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-[#A0A0A0] leading-relaxed">
                            <ReactMarkdown>{reward.claim_instructions}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Terms Card */}
                {reward.terms_conditions && (
                    <div className={CARDS.primary}>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-[#666666]" />
                            <h2 className={TYPOGRAPHY.sectionTitle}>條款與細則</h2>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-[#666666] text-xs leading-relaxed">
                            <ReactMarkdown>{reward.terms_conditions}</ReactMarkdown>
                        </div>
                    </div>
                )}

            </div>
        </MobileOptimizedLayout>
    );
}
