'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { QuizResult } from '@/lib/quiz-data'
import { Button } from '@/components/ui/button'
import { Share2, RefreshCcw, ExternalLink, Skull, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'

interface ResultCardProps {
    result: QuizResult
    onRetry: () => void
}

export function ResultCard({ result, onRetry }: ResultCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-6 pb-12"
        >
            {/* The Viral Card (Visual for Screenshot) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-[#2A2A2A] shadow-2xl">
                {/* Background Decoration */}
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-neutral-800/50 to-transparent" />

                <div className="relative p-6 flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-wider mb-6">
                        TRANSACTION PERSONALITY
                    </div>

                    {/* Image */}
                    <div className="relative w-48 h-48 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl" />
                        <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            className="object-contain drop-shadow-xl"
                        />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-white mb-2">{result.name}</h2>
                    <p className="text-sm font-mono text-neutral-400 mb-6">{result.tagline}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                        <div className="bg-[#141414] rounded-xl p-3 border border-[#222]">
                            <div className="text-[10px] text-neutral-500 mb-1">存活率 (Survival)</div>
                            <div className={cn("text-xl font-bold font-mono",
                                result.stats.survivalRate < 40 ? COLORS.negative : COLORS.positive
                            )}>
                                {result.stats.survivalRate}%
                            </div>
                        </div>
                        <div className="bg-[#141414] rounded-xl p-3 border border-[#222]">
                            <div className="text-[10px] text-neutral-500 mb-1">勝率 (Win Rate)</div>
                            <div className="text-xl font-bold font-mono text-white">
                                {result.stats.winRate}%
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-neutral-300 mb-8 border-t border-b border-white/5 py-4">
                        {result.description}
                    </p>

                    {/* Predator / Prey (Viral Hooks) */}
                    <div className="grid grid-cols-2 gap-4 w-full text-left mb-6">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1">
                                <Skull className="w-3.5 h-3.5" />
                                天敵 (Enemy)
                            </div>
                            <div className="text-sm font-bold text-red-200">
                                {result.traits.naturalEnemy}
                            </div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold mb-1">
                                <Utensils className="w-3.5 h-3.5" />
                                食物 (Prey)
                            </div>
                            <div className="text-sm font-bold text-green-200">
                                {result.traits.food}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#141414] p-4 text-[10px] text-center text-neutral-600 font-mono border-t border-[#222]">
                    CryptoTW Alpha • 交易者人格測試
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
                <Button className="w-full bg-white text-black hover:bg-neutral-200 gap-2 font-bold h-12">
                    <Share2 className="w-4 h-4" />
                    分享結果 (截圖此頁)
                </Button>

                <Button
                    variant="outline"
                    onClick={onRetry}
                    className="w-full border-neutral-800 text-neutral-400 hover:text-white"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    再測一次
                </Button>
            </div>

            {/* Product Hook (Conversion) */}
            <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-neutral-300 mb-4 font-medium">
                    💡 給 {result.name.split(' ')[0]} 的建議：<br />
                    {result.productHook.text}
                </p>
                <Link href={result.productHook.link}>
                    <Button variant="secondary" size="sm" className="gap-2">
                        {result.productHook.btnText}
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    )
}
