'use client'

import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { GLOSSARY_DATA } from '@/lib/glossary-data'
import { HelpCircle } from 'lucide-react'

// Helper to escape regex special characters
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const SORTED_TERMS = [...GLOSSARY_DATA].sort((a, b) => b.term.length - a.term.length)

export function GlossaryText({ text }: { text: string }) {
    // Simple replacement logic: Split by terms and wrap matches
    // Note: This is a basic implementation. Nested terms or overlapping terms might tricky.
    // We strictly replace only exact matches (case insensitive?) - let's do exact match first or case insensitive.

    // Construct regex pattern: (\bTerm1\b|\bTerm2\b|...)
    // \b is word boundary.
    const pattern = new RegExp(`(${SORTED_TERMS.map(g => escapeRegExp(g.term)).join('|')})`, 'gi')
    const parts = text.split(pattern)

    return (
        <span>
            <TooltipProvider delayDuration={200}>
                {parts.map((part, i) => {
                    const match = SORTED_TERMS.find(g => g.term.toLowerCase() === part.toLowerCase())
                    if (match) {
                        return (
                            <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                    <span className="underline decoration-dotted decoration-blue-500/50 cursor-help text-blue-300 font-medium mx-0.5">
                                        {part}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-neutral-900 border-neutral-800 text-neutral-200 max-w-xs p-3">
                                    <div className="font-bold text-blue-400 mb-1 flex items-center gap-1">
                                        {match.term}
                                        <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-300 border border-blue-500/20">{match.category}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed">{match.definition}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    }
                    return part
                })}
            </TooltipProvider>
        </span>
    )
}
