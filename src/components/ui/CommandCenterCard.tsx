'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlobalBrief {
    verdict: '做多' | '做空' | '觀望' | '中性'
    score: number
    action: string
    headline: string
    analysis: {
        sentiment: string
        structure: string
        catalyst: string
    }
}

export function CommandCenterCard() {
    const [brief, setBrief] = useState<GlobalBrief | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBrief = async () => {
            try {
                const res = await fetch('/api/ai/global-brief')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setBrief(data)
            } catch (err) {
                console.error('Failed to load global brief', err)
            } finally {
                setLoading(false)
            }
        }
        fetchBrief()
    }, [])

    if (loading) return <SkeletonLoader />
    if (!brief) return null

    // Brand Colors
    const brandPurple = 'text-[#8B5CF6]'
    const brandGlow = 'bg-[#8B5CF6]'

    const getVerdictColor = (v: string) => {
        if (v === '做多') return 'text-emerald-400'
        if (v === '做空') return 'text-rose-400'
        return 'text-amber-400'
    }
    const verdictColor = getVerdictColor(brief.verdict)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative overflow-hidden rounded-2xl border border-white/10 bg-[#050505]"
        >
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#8B5CF6]/5 to-transparent" />

            <div className="relative p-5 z-10">
                {/* Header: Compact Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                        <h2 className="text-xs font-bold text-[#8B5CF6] tracking-wider uppercase">
                            Command Center
                        </h2>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                        {brief.verdict === '做多' ? 'ALPHA' : brief.verdict === '做空' ? 'OMEGA' : 'ZERO'} MODE
                    </span>
                </div>

                {/* Main Verdict Section */}
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-baseline gap-3">
                        <h1 className={cn("text-4xl font-bold tracking-tighter", verdictColor)}>
                            {brief.verdict}
                        </h1>
                        <span className="text-xl font-mono text-white/30 font-medium">
                            {brief.score}<span className="text-sm">/100</span>
                        </span>
                    </div>

                    <p className="text-base font-medium text-white/90 leading-snug">
                        {brief.headline}
                    </p>

                    <div className="self-start mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                        <span className="text-[10px] font-bold text-[#8B5CF6] uppercase">Action</span>
                        <span className="w-px h-2.5 bg-[#8B5CF6]/20" />
                        <span className="text-xs font-bold text-white tracking-wide">
                            {brief.action}
                        </span>
                    </div>
                </div>

                {/* Triad List - Single Column / Compact */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <TriadRow
                        icon="📡"
                        label="Sentiment"
                        content={brief.analysis.sentiment}
                        delay={0.1}
                    />
                    <TriadRow
                        icon="📐"
                        label="Structure"
                        content={brief.analysis.structure}
                        delay={0.2}
                    />
                    <TriadRow
                        icon="📅"
                        label="Catalyst"
                        content={brief.analysis.catalyst}
                        delay={0.3}
                    />
                </div>
            </div>
        </motion.div>
    )
}

function TriadRow({ icon, label, content, delay }: { icon: string, label: string, content: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="flex items-start gap-3"
        >
            <div className="shrink-0 w-8 h-8 rounded bg-white/5 flex items-center justify-center text-sm border border-white/5">
                {icon}
            </div>
            <div className="flex flex-col pt-0.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                    {label}
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                    {content}
                </p>
            </div>
        </motion.div>
    )
}

function SkeletonLoader() {
    return (
        <div className="w-full h-[320px] rounded-2xl border border-white/5 bg-[#050505] p-5 animate-pulse">
            <div className="flex justify-between mb-6">
                <div className="h-3 w-24 bg-white/5 rounded" />
                <div className="h-3 w-12 bg-white/5 rounded" />
            </div>
            <div className="h-10 w-32 bg-white/10 rounded mb-3" />
            <div className="h-5 w-3/4 bg-white/5 rounded mb-4" />
            <div className="h-8 w-40 bg-white/5 rounded mb-8" />
            <div className="space-y-4">
                <div className="h-12 bg-white/5 rounded" />
                <div className="h-12 bg-white/5 rounded" />
                <div className="h-12 bg-white/5 rounded" />
            </div>
        </div>
    )
}
