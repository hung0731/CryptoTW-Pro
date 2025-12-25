import { QuickActionCard } from '@/components/home/QuickActionCard'
import { Activity, Users, BrainCircuit, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { MarketStatusData, Conclusion } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarketOverviewGridProps {
    status: MarketStatusData | null
    conclusion: Conclusion | null
}

export function MarketOverviewGrid({ status, conclusion }: MarketOverviewGridProps) {
    // 1. Market Radar Data
    const riskStatus = status?.market_structure?.bias || '中性'
    const score = conclusion?.sentiment_score || 50
    const riskLevel = score >= 75 ? 'RISK_ON' : score <= 25 ? 'RISK_OFF' : 'NEUTRAL'

    // 2. Smart Money Data
    const retailRatio = status?.long_short?.ratio || 1.1
    const retailBias = retailRatio > 1.2 ? '偏多' : retailRatio < 0.8 ? '偏空' : '中性'
    const smartMoneyBias = retailBias === '偏多' ? '偏空' : retailBias === '偏空' ? '偏多' : '觀望'

    // Helpers
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'RISK_ON': return 'text-emerald-500'
            case 'RISK_OFF': return 'text-red-500'
            default: return 'text-blue-400'
        }
    }

    const getBiasIcon = (bias: string) => {
        if (bias === '偏多') return <TrendingUp className="w-3 h-3" />
        if (bias === '偏空') return <TrendingDown className="w-3 h-3" />
        return <Minus className="w-3 h-3" />
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* 1. Market Radar (Compact) */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-3 flex flex-col justify-between h-[100px] relative overflow-hidden group">
                <div className="flex items-start justify-between z-10">
                    <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center text-[#808080] group-hover:text-white transition-colors">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[#525252]">得分: {score}</span>
                </div>

                <div className="z-10">
                    <div className="text-[10px] text-[#808080] font-mono mb-0.5 tracking-wider">MARKET RADAR</div>
                    <div className={cn("text-base font-black tracking-tight flex items-center gap-1.5", getRiskColor(riskLevel))}>
                        {riskLevel === 'RISK_ON' ? '積極進攻' : riskLevel === 'RISK_OFF' ? '保守防禦' : '中性震盪'}
                    </div>
                </div>
            </div>

            {/* 2. Smart Money (Compact) */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-3 flex flex-col justify-between h-[100px] relative overflow-hidden group">
                {/* Blue Scanning Effect for Smart Money */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between z-10">
                    <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center text-blue-400/80 group-hover:text-blue-400 transition-colors">
                        <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-blue-500/60">DOM: HIGH</span>
                </div>

                <div className="z-10">
                    <div className="text-[10px] text-[#808080] font-mono mb-0.5 tracking-wider">SMART MONEY</div>
                    <div className="text-base font-bold text-white flex items-center gap-1.5">
                        {smartMoneyBias}
                        <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded border",
                            smartMoneyBias === '偏多' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                smartMoneyBias === '偏空' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
                        )}>
                            {getBiasIcon(smartMoneyBias)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
