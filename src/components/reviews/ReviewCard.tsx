import Link from 'next/link';
import { MarketEvent } from '@/lib/reviews-data';

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
        <article className="group relative bg-neutral-900/40 border border-white/5 rounded-xl overflow-hidden hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-300">
            {/* Watermark Logo */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.20] group-hover:opacity-[0.30] transition-opacity rotate-12 pointer-events-none">
                {review.impactedTokens?.[0] && (
                    <img
                        src={`/tokens/${review.impactedTokens[0]}.png`}
                        className="w-16 h-16 blur-[0.5px]"
                        alt=""
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                )}
            </div>

            <div className="p-3 relative">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-500">{review.eventStartAt.replace(/-/g, '.')}</span>
                        <div className="w-[1px] h-2 bg-white/10"></div>
                        <span className="text-[10px] text-neutral-400">{typeConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {review.impactedTokens?.slice(0, 3).map(t => (
                            <span key={t} className="text-[9px] font-bold text-neutral-600 bg-white/5 px-1 rounded">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <Link href={`/reviews/${review.year}/${review.slug}`} className="block">
                    <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white mb-1.5 leading-snug">
                        {review.title.split('：')[0]}
                        {review.title.split('：')[1] && <span className="text-neutral-500 font-normal">：{review.title.split('：')[1]}</span>}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                        {review.impactSummary || review.summary}
                    </p>
                </Link>
            </div>
        </article>
    )
}
