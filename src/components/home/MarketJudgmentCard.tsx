import * as React from 'react';
import { Card } from '@/components/universal/UniversalCard';
import { cn } from '@/lib/utils';
import { type SignalType } from '@/theme/design-tokens';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketJudgmentCardProps {
    state: 'Risk-On' | 'Risk-Off' | 'Neutral';
    action: 'Accumulate' | 'Hold' | 'Reduce' | 'Wait';
    confidence: 'High' | 'Medium' | 'Low';
    reason: string;
    counterThesis: string;
    invalidationLevel: string; // e.g. "BTC < $90,500"
    timestamp: string;
}

const stateColors: Record<string, string> = {
    'Risk-On': 'text-signal-bull',
    'Risk-Off': 'text-signal-bear',
    'Neutral': 'text-signal-neutral',
};

const actionIcons: Record<string, React.ElementType> = {
    'Accumulate': TrendingUp,
    'Reduce': TrendingDown,
    'Hold': Minus,
    'Wait': AlertTriangle, // Or use a pause icon
};

export function MarketJudgmentCard({
    state,
    action,
    confidence,
    reason,
    counterThesis,
    invalidationLevel,
    timestamp,
}: MarketJudgmentCardProps) {
    const Icon = actionIcons[action] || Minus;
    const isEmergency = false; // logic hook for Break Glass

    return (
        <Card variant={isEmergency ? 'danger' : 'default'} padding="m" className="h-full min-h-[300px]">
            <div className="flex flex-col h-full">
                {/* Top: State & Confidence */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                            Market State
                        </span>
                        <h1 className={cn("text-3xl md:text-4xl font-black tracking-tight mt-1", stateColors[state])}>
                            {state}
                        </h1>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-text-tertiary">Confidence</span>
                        <div className="flex items-center gap-1 mt-1">
                            {/* Simple dot meter */}
                            <div className={cn("w-2 h-2 rounded-full", confidence === 'High' ? "bg-text-primary" : "bg-text-tertiary")} />
                            <div className={cn("w-2 h-2 rounded-full", confidence !== 'Low' ? "bg-text-primary" : "bg-text-tertiary")} />
                            <div className="w-2 h-2 rounded-full bg-text-primary" />
                        </div>
                        <span className="text-[10px] text-text-tertiary mt-1">{confidence}</span>
                    </div>
                </div>

                {/* Middle: Action & Primary Reason */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-3 rounded-lg bg-surface-2", stateColors[state])}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <span className="block text-xs text-text-secondary">Directive</span>
                            <span className="text-xl font-bold text-text-primary">{action}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="pl-3 border-l-2 border-signal-bull/50">
                            <span className="block text-xs text-text-tertiary mb-1">Primary Driver</span>
                            <p className="text-sm text-text-primary font-medium leading-relaxed">
                                {reason}
                            </p>
                        </div>
                        <div className="pl-3 border-l-2 border-signal-warn/50">
                            <span className="block text-xs text-text-tertiary mb-1">Counter-Thesis</span>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {counterThesis}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Invalidation (The Kill Switch) */}
                <div className="mt-6 pt-4 border-t border-border-subtle">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-signal-bear font-mono font-bold">
                            INVALIDATION: {invalidationLevel}
                        </span>
                        <span className="text-text-tertiary">
                            Updated: {timestamp}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
