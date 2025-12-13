'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface ExplainTooltipProps {
    term: string
    definition: React.ReactNode
    explanation?: React.ReactNode // Level 2: 怎麼解讀
    trigger?: React.ReactNode
}

export function ExplainTooltip({ term, definition, explanation, trigger }: ExplainTooltipProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <button className="inline-flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors ml-1 align-middle">
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                )}
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-neutral-900 border-t border-white/10 rounded-t-[20px] pb-12 pt-6 px-0 focus:outline-none">
                {/* Drag handle */}
                <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />

                <SheetHeader className="text-left px-6 space-y-4">
                    <div className="space-y-3">
                        <SheetTitle className="text-2xl font-bold text-white tracking-tight">{term}</SheetTitle>
                        {/* Level 1: Definition */}
                        <div className="text-base text-neutral-300 font-medium leading-relaxed">
                            {definition}
                        </div>
                    </div>
                </SheetHeader>

                {/* Level 2: Interpretation */}
                {explanation && (
                    <div className="px-6 mt-8">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 text-emerald-400">
                                💡 如何解讀？
                            </h4>
                            <div className="text-sm text-neutral-400 space-y-3 leading-relaxed">
                                {explanation}
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
