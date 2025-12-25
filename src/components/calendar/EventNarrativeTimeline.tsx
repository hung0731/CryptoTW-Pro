
import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, TrendingUp, AlertTriangle, Zap, ArrowRight, MessageSquare } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';

// v1.1 Data: Instructional Playbook (General Strategy for Event Type)
function generateTimeline(eventKey: string) {
    if (eventKey === 'cpi' || eventKey === 'ppi' || eventKey === 'pce') {
        return [
            { time: 'T-7', label: '敘事觀察 (Narrative)', content: '關注主流媒體與 KOL 對通膨的預期。若市場過度押注「通膨驟降」，需警惕數據不如預期時的劇烈回調。', risk: 'neutral' },
            { time: 'T-2', label: '籌碼檢視 (Positioning)', content: '檢查 OI (持倉量) 是否異常堆高。若 Funding Rate 顯著偏離 0.01%，代表單邊押注過重，軋空/殺多風險大增。', risk: 'high' },
            { time: 'T0', label: '避險與觀望 (Volatility)', content: '數據發布瞬間通常伴隨「上下插針 (Wick)」。建議空手觀望，等待 15 分鐘 K 線收盤確認方向後再進場。', risk: 'extreme' },
            { time: 'T+1', label: '趨勢確認 (Trend)', content: '若日線實體收盤突破關鍵互換位，且伴隨成交量放大，通常代表新趨勢確立，可順勢操作。', risk: 'medium' }
        ];
    }
    if (eventKey === 'nfp' || eventKey === 'fomc') {
        return [
            { time: 'T-7', label: '預期管理', content: '市場通常會提前 price-in 軟著陸或升息預期。注意美債殖利率與 DXY 的異常波動。', risk: 'neutral' },
            { time: 'T-2', label: '避險情緒', content: '資金通常在重大決議前回流美元避險，導致非美貨幣與 Altcoins 流動性枯竭。', risk: 'medium' },
            { time: 'T0', label: '博弈時刻', content: '非農/決議發布後，市場往往先反應「標題數據」，隨後反應「細項結構」。初次反應常是假動作。', risk: 'extreme' },
            { time: 'T+1', label: '結構破壞', content: '觀察是否破壞了原有的週線級別結構。若關鍵支撐失守，可能引發連續數日的修正行情。', risk: 'high' }
        ];
    }
    // Default / Generic
    return [
        { time: 'T-7', label: '市場預熱', content: '觀察社群媒體討論熱度。Smart Money 通常在此階段開始提前佈局或對沖。', risk: 'neutral' },
        { time: 'T-2', label: '風險對沖', content: '機構進行期權對沖 (Gamma Exposure) 導致波動率上升。建議縮小倉位或進行 Delta Neutral 策略。', risk: 'medium' },
        { time: 'T0', label: '高頻博弈', content: '流動性最差的時刻，滑點極大。除非你是高頻交易機器人，否則建議遠離鍵盤。', risk: 'extreme' },
        { time: 'T+1', label: '方向確立', content: '塵埃落定，市場回歸基本面。此時進場的勝率通常高於賭數據發布瞬間。', risk: 'neutral' }
    ];
}

export function EventNarrativeTimeline({ eventKey }: { eventKey: string }) {
    const timeline = generateTimeline(eventKey);

    return (
        <UniversalCard className="p-0 overflow-hidden mb-6">
            <div className="border-b border-[#1A1A1A] bg-[#0A0B14]">
                <SectionHeaderCard
                    title="交易邏輯與觀察重點 (Trading Strategy)"
                    icon={Clock}
                />
            </div>
            <div className="p-6 bg-[#0B0B0C] relative">
                {/* Vertical Connecting Line (Absolute Left) */}
                <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-[#1F1F1F]" />

                <div className="flex flex-col space-y-8 relative">
                    {timeline.map((item, idx) => (
                        <div key={idx} className="relative pl-12 group">
                            {/* Dot */}
                            <div className={cn(
                                "absolute left-[24px] top-1.5 w-3 h-3 rounded-full border-2 z-10 -translate-x-1/2",
                                item.time === 'T0'
                                    ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                    : "bg-[#0B0B0C] border-[#444] group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors"
                            )} />

                            {/* Content */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-xs font-bold font-mono px-2 py-0.5 rounded",
                                        item.time === 'T0' ? "bg-red-500 text-white" : "bg-[#1A1A1A] text-neutral-400"
                                    )}>
                                        {item.time}
                                    </span>
                                    <h4 className={cn(
                                        "text-base font-bold tracking-tight",
                                        item.time === 'T0' ? "text-white" : "text-neutral-300"
                                    )}>
                                        {item.label}
                                    </h4>

                                    {/* Inline Risk Badge */}
                                    <div className="ml-auto flex items-center gap-1.5">
                                        {item.risk === 'high' || item.risk === 'extreme' ? (
                                            <>
                                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                                <span className="text-[10px] text-yellow-500 font-bold uppercase">Risk High</span>
                                            </>
                                        ) : item.risk === 'medium' ? (
                                            <>
                                                <Zap className="w-3 h-3 text-blue-400" />
                                                <span className="text-[10px] text-blue-400 font-bold uppercase">Activity</span>
                                            </>
                                        ) : (
                                            <span className="text-[10px] text-neutral-600 uppercase">Wait & See</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-[#141415] border border-[#1A1A1A] group-hover:border-blue-500/30 transition-colors">
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </UniversalCard>
    );
}
