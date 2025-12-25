import Link from 'next/link';
import { MarketEvent } from '@/lib/reviews-data';
import { TYPOGRAPHY } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { UniversalCard, CardContent } from '@/components/ui/UniversalCard';

export function ReviewCard({ review }: { review: MarketEvent }) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'leverage_cleanse': return { label: '槓桿清算' };
            case 'policy_regulation': return { label: '政策監管' };
            case 'exchange_event': return { label: '交易所危機' };
            case 'macro_shock': return { label: '黑天鵝' };
            case 'market_structure': return { label: '市場結構' };
            case 'tech_event': return { label: '技術事件' };
            case 'supply_shock': return { label: '供應衝擊' };
            case 'geopolitics': return { label: '地緣政治' };
            default: return { label: '事件' };
        }
    };
    const typeConfig = getTypeConfig(review.type || 'market_structure');

    return (
        <UniversalCard variant="clickable" size="S" className="group relative overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.20] group-hover:opacity-[0.30] rotate-12 pointer-events-none z-0">
                {review.impactedTokens?.[0] && (
                    <img
                        src={`/tokens/${review.impactedTokens[0]}.png`}
                        className="w-16 h-16 blur-[0.5px] rounded-full"
                        alt=""
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                )}
            </div>

            <CardContent className="relative z-10">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className={TYPOGRAPHY.monoMicro}>{review.eventStartAt.replace(/-/g, '.')}</span>
                        <div className="w-[1px] h-2 bg-[#1A1A1A]"></div>
                        <span className={TYPOGRAPHY.caption}>{typeConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {review.impactedTokens?.slice(0, 3).map(t => (
                            <span key={t} className="text-[9px] font-bold text-[#666666] bg-[#1A1A1A] px-1 rounded">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <Link href={`/reviews/${review.year}/${review.slug}`} className="block">
                    <h3 className={cn(TYPOGRAPHY.cardTitle, "group-hover:text-white mb-1.5 leading-snug")}>
                        {review.title.split('：')[0]}
                        {review.title.split('：')[1] && <span className="text-[#666666] font-normal">：{review.title.split('：')[1]}</span>}
                    </h3>
                    <p className={cn(TYPOGRAPHY.bodySmall, "line-clamp-2")}>
                        {review.impactSummary || review.summary}
                    </p>
                </Link>
            </CardContent>
        </UniversalCard>
    )
}
