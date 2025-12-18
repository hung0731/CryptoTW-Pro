'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { QuizQuestion } from '@/lib/quiz-data'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
    question: QuizQuestion
    total: number
    index: number
    onAnswer: (score: any) => void
}

export function QuestionCard({ question, total, index, onAnswer }: QuestionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full space-y-6"
        >
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            i <= index ? "bg-white" : "bg-neutral-800"
                        )}
                    />
                ))}
            </div>

            {/* Question */}
            <div className="min-h-[100px]">
                <h2 className="text-2xl font-bold leading-tight text-white mb-2">
                    {question.text}
                </h2>
                <span className="text-sm text-neutral-500 font-mono">
                    Question {index + 1}/{total}
                </span>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAnswer(option.score)}
                        className="w-full p-4 text-left rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] hover:bg-[#1A1A1A] hover:border-neutral-700 transition-all active:scale-[0.98] group"
                    >
                        <span className="text-base text-neutral-200 group-hover:text-white transition-colors">
                            {option.text}
                        </span>
                    </button>
                ))}
            </div>
        </motion.div>
    )
}
