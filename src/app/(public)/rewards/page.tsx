'use client';

import React, { useState, useEffect } from 'react';
import { Gift, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { Button } from '@/components/ui/button';
import { RewardCard, RewardCardSkeleton, Reward } from '@/components/rewards/RewardCard';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { SiteFooter } from '@/components/SiteFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [claimedRewards, setClaimedRewards] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [rewardsRes, userRewardsRes] = await Promise.all([
                    fetch(`/api/rewards?type=${filterType}`),
                    fetch('/api/user/rewards')
                ]);

                if (rewardsRes.ok) {
                    const data = await rewardsRes.json();
                    setRewards(data.rewards || []);
                }

                if (userRewardsRes.ok) {
                    const userData = await userRewardsRes.json();
                    if (userData.rewards) {
                        setClaimedRewards(new Set(userData.rewards.map((r: any) => r.reward_id)));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [filterType]);

    const filters = [
        { id: 'all', label: '全部' },
        { id: 'exchange_promo', label: '交易所福利' },
        { id: 'raffle', label: '抽獎活動' },
        { id: 'airdrop', label: '空投領取' },
        { id: 'learn_earn', label: '學習獎勵' },
    ];

    return (
        <MobileOptimizedLayout>
            <div className="min-h-screen bg-black pb-20">
                {/* Header */}
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10] sticky top-0 z-10">
                    <SectionHeaderCard
                        title="福利中心"
                        icon={Gift}
                        description="加密貨幣優惠、空投與抽獎活動"
                    />

                    {/* Filter Scroll */}
                    <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 min-w-max">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterType(f.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filterType === f.id
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-[#151515] border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Featured Section (if any) */}
                    {!loading && rewards.some(r => r.is_featured) && filterType === 'all' && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                精選福利
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rewards.filter(r => r.is_featured).map(reward => (
                                    <RewardCard
                                        key={reward.id}
                                        reward={reward}
                                        initialClaimed={claimedRewards.has(reward.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Main List */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white">最新活動</h2>
                            <span className="text-xs text-neutral-500">{loading ? '...' : `${rewards.length} 個活動`}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <RewardCardSkeleton key={i} />
                                ))
                            ) : (
                                rewards.filter(r => !r.is_featured || filterType !== 'all').length > 0 ? (
                                    rewards.filter(r => !r.is_featured || filterType !== 'all').map(reward => (
                                        <RewardCard
                                            key={reward.id}
                                            reward={reward}
                                            initialClaimed={claimedRewards.has(reward.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-neutral-500 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-[#151515] flex items-center justify-center">
                                            <Gift className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p>目前沒有此類型的活動</p>
                                        <Button variant="outline" onClick={() => setFilterType('all')}>查看全部</Button>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <SiteFooter />
        </MobileOptimizedLayout>
    );
}
