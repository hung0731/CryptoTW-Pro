'use client'

import React from 'react'
import { QuizQuestion } from '@/lib/learn-data'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { Trophy, RefreshCcw, ArrowRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface QuizResultViewProps {
    score: number
    total: number
    wrongQuestions: QuizQuestion[]
    onRetry: () => void
    onClose: () => void
    passThreshold: number
}

export function QuizResultView({ score, total, wrongQuestions, onRetry, onClose, passThreshold }: QuizResultViewProps) {
    const isPassed = score >= passThreshold
    const percentage = Math.round((score / total) * 100)

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">

            {/* Score Card */}
            <div className="text-center mb-8">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2",
                    isPassed
                        ? "bg-green-500/10 border-green-500 text-green-500"
                        : "bg-red-500/10 border-red-500 text-red-500"
                )}>
                    <Trophy className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    {isPassed ? '挑戰成功！' : '再接再厲'}
                </h2>
                <p className="text-[#888] text-sm">
                    得分：<span className="text-white font-mono font-bold text-lg">{score}</span> / {total}
                </p>
            </div>

            {/* Weakness Analysis / CTAs */}
            <div className="w-full max-w-sm space-y-4 mb-8">
                {wrongQuestions.length > 0 && (
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-[#666] uppercase tracking-wider text-center mb-2">
                            推薦補強與實戰
                        </div>
                        {wrongQuestions.map((q) => (
                            q.explanation.cta && (
                                <Link
                                    key={q.id}
                                    href={q.explanation.cta.href}
                                    target={q.explanation.cta.type === 'external' ? '_blank' : undefined}
                                    className="block"
                                >
                                    <UniversalCard variant="subtle" className="hover:border-[#666] transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-[#CCC] group-hover:text-white transition-colors">
                                                {q.explanation.cta.label}
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-[#666] group-hover:text-white" />
                                        </div>
                                    </UniversalCard>
                                </Link>
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-3">
                {isPassed ? (
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg font-bold text-sm bg-white text-black hover:bg-gray-200"
                    >
                        完成並領取成就
                    </button>
                ) : (
                    <button
                        onClick={onRetry}
                        className="w-full py-3 rounded-lg font-bold text-sm bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> 重新挑戰
                    </button>
                )}

                {!isPassed && (
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg font-bold text-sm text-[#666] hover:text-white"
                    >
                        暫時離開
                    </button>
                )}
            </div>
        </div>
    )
}
