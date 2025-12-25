
import React from 'react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { Zap, BookOpen, AlertTriangle, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock Data for "Today's Script" (Daily Market Script)
// In a real app, this would come from a backend or CMS daily
const TODAY_SCRIPT = {
    date: '2025/12/26',
    title: '今日可能劇本：偏多震盪 → CPI 前壓抑',
    highlight: {
        event: 'CPI (Consumer Price Index)',
        time: '明天 21:30',
        forecast: '3.1%',
        previous: '3.3%',
        risk: '預期偏樂觀，若高於預期將引發修正',
    },
    signals: {
        bullish: { label: '多頭信心', desc: 'OI 緩慢上升（低槓桿）', status: 'optimal' },
        neutral: { label: '觀望氣氛', desc: 'Funding 接近中性 (0.01%)', status: 'neutral' },
        bearish: { label: '宏觀風險', desc: '美元指數 (DXY) 突破 104', status: 'warning' },
    },
    narrative: '今日市場像一場悶燒的對峙賽，多空雙方都在等待明天的 CPI 裁判吹哨。早盤亞股疲弱可能拖累加密貨幣流動性，建議關注 42k 支撐位。'
};

export function DailyMarketContext() {
    return (
        <UniversalCard className="mb-8 p-0 overflow-hidden border-l-4 border-l-blue-500">
            {/* Standard Header */}
            <div className="border-b border-[#1A1A1A] bg-[#0A0B14]">
                <SectionHeaderCard
                    title="今日市場劇本"
                    icon={Zap}
                    description={TODAY_SCRIPT.date}
                    className="bg-transparent p-4"
                    rightElement={
                        <Link href="/calendar" className="text-xs font-bold text-blue-400 flex items-center gap-1 hover:underline">
                            查看完整日曆
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    }
                />
            </div>

            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Script & Highlight */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                            {TODAY_SCRIPT.title}
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            {TODAY_SCRIPT.narrative}
                        </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">📌 重點關注</span>
                            <span className="text-xs text-blue-300 font-mono">{TODAY_SCRIPT.highlight.time}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-white">{TODAY_SCRIPT.highlight.event}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                            <div>
                                <span className="text-neutral-500 block mb-0.5">預期值</span>
                                <span className="text-white font-mono font-bold">{TODAY_SCRIPT.highlight.forecast}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block mb-0.5">前值</span>
                                <span className="text-neutral-400 font-mono">{TODAY_SCRIPT.highlight.previous}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-yellow-500/90 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{TODAY_SCRIPT.highlight.risk}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Verification Signals */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-px bg-[#333] flex-1" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">信號驗證</span>
                        <div className="h-px bg-[#333] flex-1" />
                    </div>

                    <div className="space-y-3">
                        {/* Bullish Signal */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#222]">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-500 mb-0.5">{TODAY_SCRIPT.signals.bullish.label}</div>
                                <div className="text-xs text-neutral-400">{TODAY_SCRIPT.signals.bullish.desc}</div>
                            </div>
                        </div>

                        {/* Neutral Signal */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#222]">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                <Minus className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-yellow-500 mb-0.5">{TODAY_SCRIPT.signals.neutral.label}</div>
                                <div className="text-xs text-neutral-400">{TODAY_SCRIPT.signals.neutral.desc}</div>
                            </div>
                        </div>

                        {/* Bearish Signal */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#222]">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-red-500 mb-0.5">{TODAY_SCRIPT.signals.bearish.label}</div>
                                <div className="text-xs text-neutral-400">{TODAY_SCRIPT.signals.bearish.desc}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UniversalCard>
    );
}
