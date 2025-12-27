'use client'

import { useState, useEffect } from 'react'
import { EnrichedMacroEvent } from '@/lib/services/macro-events'

interface AISummaryData {
    summary: string
    recommendations?: Array<{ title: string, path: string, reason?: string }>
}

const CACHE_KEY = 'calendar-ai-summary-v2'
const CACHE_TTL = 4 * 60 * 60 * 1000 // 4 hours

export function useCalendarAISummary(enrichedEvents: EnrichedMacroEvent[]) {
    const [aiSummary, setAiSummary] = useState<AISummaryData>({ summary: '' })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAISummary = async () => {
            // Check cache first
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached)
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setAiSummary(data)
                        setIsLoading(false)
                        return
                    }
                } catch (e) {
                    // Invalid cache, continue to fetch
                }
            }

            try {
                const eventsData = enrichedEvents
                    .filter(e => e.daysUntil < 365)
                    .map(e => e.aiPayload)

                const res = await fetch('/api/ai/calendar-summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: eventsData })
                })

                const result = await res.json()
                if (result.summary) {
                    const summaryData = {
                        summary: result.summary,
                        recommendations: result.recommended_readings
                    }
                    setAiSummary(summaryData)
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: summaryData,
                        timestamp: Date.now()
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch calendar AI summary:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (enrichedEvents.length > 0) {
            void fetchAISummary()
        }
    }, [enrichedEvents])

    return { aiSummary, isLoading }
}
