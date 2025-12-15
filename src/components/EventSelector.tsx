'use client'

import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface EventSelectorProps {
    value: string | null
    onChange: (slug: string) => void
    excludeSlug?: string
    label?: string
}

export function EventSelector({ value, onChange, excludeSlug, label }: EventSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Filter available events
    const events = REVIEWS_DATA.filter(e => e.slug !== excludeSlug)

    // Selected event
    const selected = REVIEWS_DATA.find(e => e.slug === value)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="flex-1" ref={ref}>
            {label && (
                <p className="text-[10px] text-neutral-500 mb-1.5 uppercase tracking-wider">{label}</p>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full px-3 py-2.5 rounded-lg border text-left flex items-center justify-between transition-colors",
                    isOpen ? "border-neutral-600 bg-neutral-900" : "border-white/10 bg-neutral-900/50 hover:bg-neutral-900"
                )}
            >
                {selected ? (
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            selected.importance === 'S' ? "bg-neutral-800 text-neutral-300" : "bg-neutral-800/50 text-neutral-400"
                        )}>
                            {selected.importance}
                        </span>
                        <span className="text-sm text-neutral-300">{selected.year} {selected.title.split('：')[0]}</span>
                    </div>
                ) : (
                    <span className="text-sm text-neutral-500">選擇事件...</span>
                )}
                <ChevronDown className={cn("w-4 h-4 text-neutral-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-neutral-900 shadow-xl">
                    {events.map((event) => (
                        <button
                            key={event.slug}
                            onClick={() => {
                                onChange(event.slug)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-neutral-800 transition-colors border-b border-white/5 last:border-0",
                                value === event.slug && "bg-neutral-800"
                            )}
                        >
                            <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                event.importance === 'S' ? "bg-neutral-700 text-neutral-200" : "bg-neutral-800 text-neutral-400"
                            )}>
                                {event.importance}
                            </span>
                            <span className="text-xs font-mono text-neutral-500">{event.year}</span>
                            <span className="text-sm text-neutral-300 flex-1 truncate">{event.title.split('：')[0]}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
