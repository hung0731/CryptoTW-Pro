'use client'

import React, { useState } from 'react'
import { Quiz, QuizQuestion } from '@/lib/learn-data'
import { UniversalCard, CardVariant } from '@/components/ui/UniversalCard'
import { X, Check, ArrowRight, AlertCircle, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion' // Creating dependency here, might need to check if user has this, but standard for Next.js app
import { QuizResultView } from './QuizResultView'

// Fallback simple animation if framer-motion not available or just use CSS
// But for "WOW" effect, subtle JS animations are good.

interface QuizModalProps {
    quiz: Quiz
    onClose: () => void
    onPass: (score: number, wrongQuestions: string[]) => void
}

export function QuizModal({ quiz, onClose, onPass }: QuizModalProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([])

    const question = quiz.questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

    const handleSelect = (optionId: string) => {
        if (isAnswered) return
        setSelectedOption(optionId)
    }

    const handleSubmit = () => {
        if (!selectedOption) return

        const correct = question.options.find(o => o.isCorrect)
        const isCorrect = selectedOption === correct?.id

        setIsAnswered(true)

        if (isCorrect) {
            setScore(prev => prev + 1)
        } else {
            setWrongQuestions(prev => [...prev, question])
        }
    }

    const handleNext = () => {
        if (isLastQuestion) {
            setShowResult(true)
        } else {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedOption(null)
            setIsAnswered(false)
        }
    }

    if (showResult) {
        return <QuizResultView
            score={score}
            total={quiz.questions.length}
            wrongQuestions={wrongQuestions}
            onRetry={() => {
                setScore(0)
                setCurrentQuestionIndex(0)
                setWrongQuestions([])
                setSelectedOption(null)
                setIsAnswered(false)
                setShowResult(false)
            }}
            onClose={() => {
                if (score >= Math.ceil(quiz.questions.length * 0.5)) { // Pass Threshold
                    onPass(score, wrongQuestions.map(q => q.id))
                } else {
                    onClose()
                }
            }}
            passThreshold={Math.ceil(quiz.questions.length * 0.5)}
        />
    }

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] flex flex-col">
            {/* Header */}
            <div className="px-4 h-14 flex items-center justify-between border-b border-[#1A1A1A]">
                <div className="text-xs font-mono text-[#666]">
                    Q{currentQuestionIndex + 1} / {quiz.questions.length}
                </div>
                <button onClick={onClose}><X className="w-5 h-5 text-[#888]" /></button>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-lg font-bold text-white mb-6 leading-relaxed">
                    {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                    {question.options.map((option) => {
                        const isSelected = selectedOption === option.id
                        const isCorrect = option.isCorrect

                        let variant: CardVariant = "default"
                        // Logic for styling after answer reveal
                        if (isAnswered) {
                            if (isCorrect) variant = "success" // Green
                            else if (isSelected && !isCorrect) variant = "danger" // Red
                            else variant = "subtle" // Dim others
                        } else {
                            if (isSelected) variant = "highlight" // White border
                        }

                        return (
                            <UniversalCard
                                key={option.id}
                                variant={variant}
                                onClick={() => handleSelect(option.id)}
                                className={cn(
                                    "cursor-pointer transition-all active:scale-[0.99]",
                                    !isAnswered && !isSelected && "hover:border-[#333]",
                                    // isAnswered && !isSelected && !isCorrect && "opacity-50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        variant === 'highlight' ? "text-white" : "text-[#A0A0A0]",
                                        (variant === 'success' || variant === 'danger') && "text-white"
                                    )}>
                                        {option.text}
                                    </span>
                                    {isAnswered && isCorrect && <Check className="w-4 h-4 text-green-500" />}
                                    {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-500" />}
                                </div>
                            </UniversalCard>
                        )
                    })}
                </div>

                {/* Explanation (Show after answer) */}
                {isAnswered && (
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333]">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-blue-400">解析</span>
                            </div>
                            <p className="text-sm text-[#CCC] leading-relaxed">
                                {question.explanation.text}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-[#1A1A1A] bg-[#0A0A0A]">
                {!isAnswered ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className={cn(
                            "w-full py-3 rounded-lg font-bold text-sm transition-all",
                            selectedOption
                                ? "bg-white text-black hover:bg-gray-200"
                                : "bg-[#1A1A1A] text-[#666] cursor-not-allowed"
                        )}
                    >
                        送出答案
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-full py-3 rounded-lg font-bold text-sm bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                        {isLastQuestion ? '查看結果' : '下一題'} <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
