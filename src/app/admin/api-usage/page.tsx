'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS } from '@/lib/design-tokens';

interface EndpointStat {
    endpoint: string;
    totalCalls: number;
    lastCalled: string;
    callsPerHour: number;
}

interface ApiUsageData {
    endpoints: EndpointStat[];
    totalCalls: number;
}

export default function ApiUsagePage() {
    const [data, setData] = useState<ApiUsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/api-usage');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                setLastRefresh(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch API usage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // 每 30 秒自動刷新
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatEndpoint = (endpoint: string) => {
        // 移除 /api/ 前綴使其更易讀
        return endpoint.replace('/api/', '');
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return '剛剛';
        if (diffMins < 60) return `${diffMins} 分鐘前`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小時前`;
        return date.toLocaleDateString('zh-TW');
    };

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={cn(TYPOGRAPHY.sectionTitle, "mb-1")}>API 使用統計</h1>
                        <p className={cn("text-sm", COLORS.textTertiary)}>
                            追蹤外部 API（Coinglass 等）的調用次數
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        刷新
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className={cn(CARDS.secondary, "p-4")}>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className={cn("text-xs", COLORS.textTertiary)}>總調用次數</span>
                        </div>
                        <span className="text-2xl font-mono font-bold">
                            {data?.totalCalls?.toLocaleString() ?? '—'}
                        </span>
                    </div>
                    <div className={cn(CARDS.secondary, "p-4")}>
                        <div className="flex items-center gap-2 mb-2">
                            <ExternalLink className="w-4 h-4 text-green-400" />
                            <span className={cn("text-xs", COLORS.textTertiary)}>活躍端點</span>
                        </div>
                        <span className="text-2xl font-mono font-bold">
                            {data?.endpoints?.length ?? 0}
                        </span>
                    </div>
                    <div className={cn(CARDS.secondary, "p-4")}>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className={cn("text-xs", COLORS.textTertiary)}>上次刷新</span>
                        </div>
                        <span className="text-sm font-mono">
                            {lastRefresh?.toLocaleTimeString('zh-TW') ?? '—'}
                        </span>
                    </div>
                </div>

                {/* Endpoints Table */}
                <div className={cn(CARDS.primary, "overflow-hidden")}>
                    <div className="p-4 border-b border-white/5">
                        <h2 className={cn(TYPOGRAPHY.sectionLabel)}>端點明細</h2>
                    </div>

                    {loading && !data ? (
                        <div className="p-8 text-center">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-500" />
                            <span className={cn("text-sm", COLORS.textTertiary)}>載入中...</span>
                        </div>
                    ) : data?.endpoints?.length === 0 ? (
                        <div className="p-8 text-center">
                            <span className={cn("text-sm", COLORS.textTertiary)}>
                                尚無 API 調用記錄
                            </span>
                            <p className={cn("text-xs mt-2", COLORS.textTertiary)}>
                                當應用開始調用外部 API 後，統計資料會在這裡顯示
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {/* Header */}
                            <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-white/[0.02] text-[10px] text-neutral-500 uppercase font-medium">
                                <div>端點</div>
                                <div className="text-right">總調用</div>
                                <div className="text-right">每小時</div>
                                <div className="text-right">最後調用</div>
                            </div>

                            {/* Rows */}
                            {data?.endpoints.map((stat, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-white/[0.02]">
                                    <div className="font-mono text-xs text-white truncate">
                                        {formatEndpoint(stat.endpoint)}
                                    </div>
                                    <div className="text-right font-mono text-sm font-bold">
                                        {stat.totalCalls.toLocaleString()}
                                    </div>
                                    <div className="text-right font-mono text-sm">
                                        <span className={cn(
                                            stat.callsPerHour > 100 ? "text-red-400" :
                                                stat.callsPerHour > 50 ? "text-amber-400" : "text-green-400"
                                        )}>
                                            {stat.callsPerHour}
                                        </span>
                                    </div>
                                    <div className={cn("text-right text-xs", COLORS.textTertiary)}>
                                        {formatTime(stat.lastCalled)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Note */}
                <p className={cn("text-center text-[10px] mt-6", COLORS.textTertiary)}>
                    統計資料僅保留 24 小時，伺服器重啟後會重置
                </p>
            </div>
        </main>
    );
}
