'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_QUESTIONS, calculateQuizResult, QuizResult } from '@/lib/quiz-data'
import { QuestionCard } from './QuestionCard'
import { ResultCard } from './ResultCard'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'

export function QuizShell() {
    const [mode, setMode] = useState<'start' | 'quiz' | 'result'>('start')
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [scores, setScores] = useState({ d: 0, h: 0, t: 0, e: 0 })
    const [result, setResult] = useState<QuizResult | null>(null)

    const handleAnswer = (scoreImpact: { d?: number, h?: number, t?: number, e?: number }) => {
        const newScores = {
            d: scores.d + (scoreImpact.d || 0),
            h: scores.h + (scoreImpact.h || 0),
            t: scores.t + (scoreImpact.t || 0),
            e: scores.e + (scoreImpact.e || 0)
        }
        setScores(newScores)

        if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentQIndex(currentQIndex + 1)
        } else {
            const finalResult = calculateQuizResult(newScores)
            setResult(finalResult)
            setMode('result')
        }
    }

    const resetQuiz = () => {
        setScores({ d: 0, h: 0, t: 0, e: 0 })
        setCurrentQIndex(0)
        setResult(null)
        setMode('start')
    }

    return (
        <div className="w-full max-w-md mx-auto min-h-[600px] flex flex-col justify-center">
            <AnimatePresence mode='wait'>
                {mode === 'start' && (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-8 p-6"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 mb-4 ring-1 ring-white/10">
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                                交易者人格測試
                            </h1>
                            <p className="text-neutral-400 text-lg">
                                你是嗜血的狼，還是佛系的獅子？<br />
                                5題測出你的幣圈本命動物。
                            </p>
                        </div>

                        <Button
                            onClick={() => setMode('quiz')}
                            className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-neutral-200 rounded-xl"
                        >
                            開始測試
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                )}

                {mode === 'quiz' && (
                    <QuestionCard
                        key={`q-${currentQIndex}`}
                        question={QUIZ_QUESTIONS[currentQIndex]}
                        total={QUIZ_QUESTIONS.length}
                        index={currentQIndex}
                        onAnswer={handleAnswer}
                    />
                )}

                {mode === 'result' && result && (
                    <ResultCard
                        result={result}
                        onRetry={resetQuiz}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
