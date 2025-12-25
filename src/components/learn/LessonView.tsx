'use client'

import React, { useState } from 'react'
import { LearnChapter } from '@/lib/learn-data'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { X, ArrowRight, BrainCircuit, GraduationCap, AlertCircle, Info, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPACING, TYPOGRAPHY, BUTTONS, SURFACE } from '@/lib/design-tokens'
import ReactMarkdown from 'react-markdown'
import { QuizModal } from './QuizModal'
import { GlossaryText } from './GlossaryText'

interface LessonViewProps {
    chapter: LearnChapter
    onClose: () => void
    onComplete: (score: number, wrongQuestions: string[]) => void
}

export function LessonView({ chapter, onClose, onComplete }: LessonViewProps) {
    const [showQuiz, setShowQuiz] = useState(false)

    return (
        <div className="fixed inset-0 z-[60] bg-[#000000] flex flex-col animate-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-xl z-50 sticky top-0">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#666] uppercase tracking-widest font-bold">CHAPTER</span>
                    <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{chapter.title}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1A1A1A] transition-colors"
                >
                    <X className="w-5 h-5 text-[#888]" />
                </button>
            </div>

            {/* Scroll Progress Bar (Simplified as just completion indicator for now) */}
            <div className="h-1 bg-[#1A1A1A] w-full">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[30%]" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-48 bg-gradient-to-b from-black to-[#050505]">
                <div className="max-w-xl mx-auto mb-8">
                    <UniversalCard variant="default" className="p-0 overflow-hidden border-[#333]">
                        {/* Header Section */}
                        <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                            <SectionHeaderCard
                                title={chapter.title}
                                description="本章節重點內容"
                                icon={Lightbulb}
                            />
                        </div>

                        {/* Content List */}
                        <div className="flex flex-col relative bg-[#050505]">
                            {/* Background Grid Pattern */}
                            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                            />

                            <div className="relative z-10">
                                {chapter.blocks.map((block, idx) => {
                                    // Unified Row Style - Neutral
                                    const rowClassName = "px-6 py-6 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0A0A0A] transition-colors group"

                                    return (
                                        <div key={idx} className={rowClassName}>
                                            {/* Block Content Renderer */}
                                            {block.type === 'text' && (
                                                <div className="prose prose-invert prose-sm max-w-none 
                                                    prose-headings:text-white prose-headings:font-bold prose-headings:mb-3
                                                    prose-p:text-[#B0B0B0] prose-p:leading-relaxed
                                                    prose-strong:text-white prose-strong:font-bold
                                                    prose-li:text-[#B0B0B0]
                                                ">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ children }) => (
                                                                <p className="mb-4 last:mb-0">
                                                                    {React.Children.map(children, child =>
                                                                        typeof child === 'string' ? <GlossaryText text={child} /> : child
                                                                    )}
                                                                </p>
                                                            ),
                                                            li: ({ children }) => (
                                                                <li className="text-[#C0C0C0]">
                                                                    {React.Children.map(children, child =>
                                                                        typeof child === 'string' ? <GlossaryText text={child} /> : child
                                                                    )}
                                                                </li>
                                                            )
                                                        }}
                                                    >
                                                        {block.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}

                                            {block.type === 'key-point' && (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                                            <BrainCircuit className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="font-bold text-white text-sm">{block.title}</h4>
                                                    </div>
                                                    <ul className="space-y-2 pl-1">
                                                        {block.points.map((point, pIdx) => (
                                                            <li key={pIdx} className="flex items-start gap-3 text-sm text-[#DDD]">
                                                                <span className="text-purple-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {block.type === 'callout' && (
                                                <div className="flex gap-4">
                                                    {/* Semantic Icon Column */}
                                                    <div className="shrink-0 pt-0.5">
                                                        {block.variant === 'info' && <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Info className="w-4 h-4" /></div>}
                                                        {block.variant === 'warning' && <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500"><AlertCircle className="w-4 h-4" /></div>}
                                                        {block.variant === 'tip' && <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500"><Lightbulb className="w-4 h-4" /></div>}
                                                    </div>

                                                    {/* Content Column */}
                                                    <div className="flex-1">
                                                        {block.title && (
                                                            <h5 className="font-bold text-sm mb-1.5 text-white">
                                                                {block.title}
                                                            </h5>
                                                        )}
                                                        <div className="text-sm text-[#999] leading-relaxed">
                                                            <ReactMarkdown>{block.content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'image' && (
                                                <div className="rounded-xl overflow-hidden border border-white/10 relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={block.src} alt={block.caption || 'Lesson Image'} className="w-full h-auto" />
                                                    {block.caption && (
                                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-md">
                                                            <p className="text-[10px] text-center text-white/80">{block.caption}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Practice Section (Integrated as last row) */}
                                {chapter.practice && (
                                    <div className="px-6 py-6 border-t border-[#1A1A1A] hover:bg-[#0A0A0A] transition-colors">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                                                <BrainCircuit className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">實戰練習</span>
                                        </div>
                                        <p className="text-sm text-[#DDD] leading-relaxed">
                                            {chapter.practice}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </UniversalCard>
                </div>
            </div>

            {/* Checkpoint Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pt-10">
                <div
                    onClick={() => setShowQuiz(true)}
                    className="w-full max-w-[480px] mx-auto"
                >
                    <UniversalCard
                        variant="highlight"
                        size="M"
                        className="cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all border-white/20"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#888] font-medium mb-0.5">Checkpoint</div>
                                    <div className="text-sm font-bold text-white">檢測你是否真的學會</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                    </UniversalCard>
                </div>
            </div>

            {/* Quiz Modal */}
            {showQuiz && (
                <QuizModal
                    quiz={chapter.quiz}
                    onClose={() => setShowQuiz(false)}
                    onPass={(score: number, wrongQuestions: string[]) => {
                        setShowQuiz(false)
                        onComplete(score, wrongQuestions) // Mark chapter as done with score and wrongs
                        onClose() // Close lesson view
                    }}
                />
            )}
        </div>
    )
}
