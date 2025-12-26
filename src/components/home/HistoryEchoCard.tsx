import Link from 'next/link'
import { ArrowRight, History, GitCompare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CARDS, TYPOGRAPHY } from '@/lib/design-tokens'
import { HistoricalMatch } from '@/lib/historical-matcher'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard } from '@/components/ui/UniversalCard'

interface HistoryEchoCardProps {
    match: HistoricalMatch | null
}

export function HistoryEchoCard({ match }: HistoryEchoCardProps) {
    if (!match) return null

    return (
        <section className="space-y-3 mt-8 mb-8 relative">
            {/* Ghost Seam (Top) */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <SectionHeaderCard
                title="歷史映射"
                icon={History}
                className="mb-4 px-1"
            />

            <Link href={`/reviews/${match.event.year}/${match.event.slug}`} className="block group">
                <UniversalCard variant="lumaClickable" className="relative p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <GitCompare className="w-3 h-3" />
                                    {match.similarityScore}% 相似
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono">
                                    {match.event.year}
                                </span>
                            </div>

                            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                                {match.event.title}
                            </h3>

                            <p className="text-xs text-neutral-400 leading-relaxed max-w-[280px]">
                                {match.matchReason}
                            </p>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </UniversalCard>
            </Link>
        </section>
    )
}
