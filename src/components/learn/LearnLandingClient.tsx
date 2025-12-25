'use client'

import React, { useState, useEffect } from 'react'
import { LEARN_LEVELS, LearnLevel, LearnChapter } from '@/lib/learn-data'
import { UniversalCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/UniversalCard'
import { ChevronDown, ChevronRight, CheckCircle2, Lock, PlayCircle, Trophy, BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { LessonView } from './LessonView' // Will create this next

import { useSearchParams } from 'next/navigation'

export function LearnLandingClient() {
    const searchParams = useSearchParams()
    const fromParam = searchParams.get('from')

    const [expandedLevel, setExpandedLevel] = useState<string | null>(() => {
        // Auto-expand based on 'from' param (Contextual Hint)
        if (fromParam) {
            // Simple mapping logic: if from indicator, maybe expand Level 2 (Data)
            // ideally we map slug to specific level, but for now defaults to Level 2 for indicators
            return 'level-2'
        }
        return 'level-0'
    })

    const [selectedChapter, setSelectedChapter] = useState<LearnChapter | null>(null)
    const [notebookOpen, setNotebookOpen] = useState(false)

    // Real progress state
    const [progress, setProgress] = useState<{
        completedChapters: string[],
        quizScores: Record<string, number>,
        wrongQuestions: Record<string, string[]>
    }>({
        completedChapters: [],
        quizScores: {},
        wrongQuestions: {}
    })

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch('/api/learn/progress')
                if (res.ok) {
                    const data = await res.json()
                    if (data.progress) {
                        setProgress(data.progress)
                    }
                }
            } catch (error) {
                console.error('Failed to load progress', error)
            }
        }
        fetchProgress()
    }, [])

    const completedChapters = new Set(progress.completedChapters)

    const toggleLevel = (levelId: string) => {
        if (expandedLevel === levelId) {
            setExpandedLevel(null)
        } else {
            setExpandedLevel(levelId)
        }
    }

    return (
        <div className={cn("min-h-screen pb-24", SPACING.pageTop)}>
            {/* Header */}
            <div className={cn("px-4 mb-6")}>
                <h1 className={TYPOGRAPHY.pageTitle}>加密學院</h1>
                <p className={TYPOGRAPHY.bodyDefault}>Zero to Hero：從韭菜到鐮刀的修煉之路</p>
            </div>

            {/* Review Section (Wrong Question Notebook) */}
            {Object.keys(progress.wrongQuestions).length > 0 && (
                <div className="px-4 mb-6">
                    <UniversalCard
                        variant="highlight"
                        onClick={() => setNotebookOpen(!notebookOpen)}
                        className="border-red-500/20 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <BrainCircuit className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-0.5">錯題筆記本</div>
                                    <div className="text-sm text-white">
                                        你累積了 <span className="font-bold">{Object.values(progress.wrongQuestions).flat().length}</span> 題待複習
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-red-500 transition-transform", notebookOpen && "rotate-180")} />
                        </div>

                        {/* Expanded List */}
                        {notebookOpen && (
                            <div className="mt-4 pt-4 border-t border-red-500/10 space-y-2 animate-in slide-in-from-top-2">
                                {Object.entries(progress.wrongQuestions).map(([quizId, questions]) => {
                                    if (questions.length === 0) return null

                                    // Find chapter title (Naive search)
                                    let chapterTitle = 'Unknown Chapter'
                                    let chapter: LearnChapter | undefined

                                    for (const lvl of LEARN_LEVELS) {
                                        const found = lvl.chapters.find(c => c.quiz.id === quizId)
                                        if (found) {
                                            chapter = found
                                            chapterTitle = found.title
                                            break
                                        }
                                    }

                                    return (
                                        <div
                                            key={quizId}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (chapter) setSelectedChapter(chapter)
                                            }}
                                            className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                <span className="text-sm text-[#DDD] group-hover:text-white transition-colors">
                                                    {chapterTitle}
                                                </span>
                                            </div>
                                            <span className="text-xs text-red-400 font-mono">
                                                {questions.length} 題錯誤
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </UniversalCard>
                </div>
            )}

            {/* Level List */}
            <div className={cn("space-y-4 px-4")}>
                {LEARN_LEVELS.map((level) => {
                    const isExpanded = expandedLevel === level.id
                    // Strict Progression Locking
                    let isLocked = false
                    if (level.level > 0) {
                        const prevLevel = LEARN_LEVELS[level.level - 1]
                        if (prevLevel) {
                            const totalPrev = prevLevel.chapters.length
                            const finishedPrev = prevLevel.chapters.filter(c => completedChapters.has(c.id)).length
                            // Lock if < 80% completed
                            if ((finishedPrev / totalPrev) < 0.8) {
                                isLocked = true
                            }
                        }
                    }

                    // Calculation for progress bar (Mock)
                    const totalChapters = level.chapters.length
                    const completedInLevel = level.chapters.filter(c => completedChapters.has(c.id)).length
                    const progressPercent = Math.round((completedInLevel / totalChapters) * 100)

                    return (
                        <div key={level.id} className="relative">
                            {/* Connector Line */}
                            {level.level < LEARN_LEVELS.length - 1 && (
                                <div className="absolute left-[26px] top-12 bottom-[-16px] w-0.5 bg-[#1A1A1A] -z-10" />
                            )}

                            <UniversalCard
                                variant={isLocked ? "subtle" : "clickable"}
                                size="M"
                                onClick={() => !isLocked && toggleLevel(level.id)}
                                className={cn(isLocked && "opacity-60 grayscale")}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon Badge */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border",
                                        isLocked
                                            ? "bg-[#1A1A1A] border-[#2A2A2A] text-[#666]"
                                            : "bg-[#0A0A0A] border-[#333] text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                    )}>
                                        <level.icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">
                                                Level {level.level}
                                            </span>
                                            {progressPercent === 100 && (
                                                <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    已完成
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={TYPOGRAPHY.cardTitle}>{level.title}</h3>
                                        <p className={TYPOGRAPHY.bodyDefault}>{level.description}</p>

                                        {/* Progress Bar */}
                                        {!isLocked && (
                                            <div className="mt-3 w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white transition-all duration-500 ease-out"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1 text-[#666]">
                                        {isLocked ? <Lock className="w-4 h-4" /> : (
                                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Chapters */}
                                {isExpanded && !isLocked && (
                                    <div className="mt-6 space-y-3 pl-4 border-l border-[#1A1A1A] ml-6">
                                        {level.chapters.map((chapter) => {
                                            const isCompleted = completedChapters.has(chapter.id)
                                            return (
                                                <div
                                                    key={chapter.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedChapter(chapter)
                                                    }}
                                                    className={cn(
                                                        "group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                        "bg-[#0F0F10] border-transparent hover:border-[#333] hover:bg-[#141414]",
                                                        isCompleted && "opacity-70"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center bg-[#1A1A1A] text-[#666] group-hover:text-white transition-colors",
                                                            isCompleted && "bg-green-900/20 text-green-500"
                                                        )}>
                                                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                                        </div>
                                                        <span className={cn(
                                                            "text-sm font-medium transition-colors",
                                                            isCompleted ? "text-[#888]" : "text-white group-hover:text-white"
                                                        )}>
                                                            {chapter.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </UniversalCard>
                        </div>
                    )
                })}
            </div>

            {/* Lesson Viewer Modal */}
            {selectedChapter && (
                <LessonView
                    chapter={selectedChapter}
                    onClose={() => setSelectedChapter(null)}
                    onComplete={async (score: number, wrongQuestions: string[]) => {
                        const chapterId = selectedChapter.id

                        // Optimistic Update
                        setProgress(prev => ({
                            ...prev,
                            completedChapters: [...prev.completedChapters, chapterId],
                            quizScores: { ...prev.quizScores, [selectedChapter.quiz.id]: score },
                            wrongQuestions: { ...prev.wrongQuestions, [selectedChapter.quiz.id]: wrongQuestions }
                        }))
                        setSelectedChapter(null)

                        // API Call
                        try {
                            await fetch('/api/learn/progress', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    completed: chapterId,
                                    score,
                                    quizId: selectedChapter.quiz.id,
                                    prevWrongQuestions: wrongQuestions // Send new wrong list
                                })
                            })
                        } catch (e) {
                            console.error('Failed to save progress', e)
                        }
                    }}
                />
            )}
        </div>
    )
}
