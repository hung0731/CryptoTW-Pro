import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import REVIEWS_HISTORY from '@/data/reviews-history.json'

interface UseReviewChartDataProps {
    type: string
    eventStart: string
    reviewSlug?: string
    viewMode: 'standard' | 'focus'
    focusWindow?: [number, number]
    isPercentage?: boolean
    overrideData?: any[]
}

export function useReviewChartData({
    type,
    eventStart,
    reviewSlug,
    viewMode,
    focusWindow,
    isPercentage = false,
    overrideData
}: UseReviewChartDataProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [yDomain, setYDomain] = useState<any>(['auto', 'auto'])

    const getDaysDiff = (dateStr: string) => {
        const date = new Date(dateStr)
        const start = new Date(eventStart)
        const diffTime = date.getTime() - start.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }

    const getDateFromDaysDiff = (diff: number) => {
        const start = new Date(eventStart)
        const target = new Date(start)
        target.setDate(start.getDate() + diff)
        return format(target, 'yyyy-MM-dd')
    }

    useEffect(() => {
        const loadData = () => {
            try {
                let chartData: any[] = []

                if (overrideData) {
                    chartData = overrideData
                } else {
                    if (!reviewSlug) {
                        setLoading(false)
                        return
                    }
                    // @ts-expect-error: Dynamic property access on imported JSON
                    const reviewData = REVIEWS_HISTORY[reviewSlug]
                    if (!reviewData) {
                        setLoading(false)
                        return
                    }

                    if (type === 'price' || type === 'supply') {
                        chartData = reviewData.price || []
                    } else if (type === 'flow') {
                        chartData = reviewData.flow || []
                    } else if (type === 'oi') {
                        chartData = reviewData.oi || []
                    } else if (type === 'fgi') {
                        chartData = reviewData.fgi || []
                    } else if (type === 'funding') {
                        chartData = reviewData.funding || []
                    } else if (type === 'liquidation') {
                        chartData = reviewData.liquidation || []
                    } else if (type === 'longShort') {
                        chartData = reviewData.longShort || []
                    } else if (type === 'basis') {
                        chartData = reviewData.basis || []
                    } else if (type === 'premium') {
                        chartData = reviewData.premium || []
                    } else if (type === 'stablecoin') {
                        chartData = reviewData.stablecoin || []
                    }
                }

                // Filter based on View Mode
                const filteredData = chartData.filter((item: any) => {
                    const daysDiff = getDaysDiff(item.date)
                    if (viewMode === 'focus' && focusWindow) {
                        return daysDiff >= focusWindow[0] && daysDiff <= focusWindow[1]
                    }
                    // Standard: T-30 ~ T+30
                    return daysDiff >= -30 && daysDiff <= 30
                })

                // Normalization Logic (Price & OI)
                const shouldNormalize = (isPercentage && type === 'price') || type === 'oi'

                if (shouldNormalize && filteredData.length > 0) {
                    // Normalize to Percentage Change from D0 (eventStart)
                    const startTimestamp = new Date(eventStart).getTime()
                    // Find D0 item
                    let baseItem = filteredData.find((item: any) => new Date(item.date).getTime() === startTimestamp)
                    if (!baseItem) {
                        const dates = filteredData.map((d: any) => Math.abs(new Date(d.date).getTime() - startTimestamp))
                        const minIdx = dates.indexOf(Math.min(...dates))
                        baseItem = filteredData[minIdx]
                    }

                    const valKey = type === 'oi' ? 'oi' : 'price'
                    const baseVal = baseItem?.[valKey] || 1

                    // Processing Loop & MaxAbs Calculation
                    let maxAbs = 0

                    const processedData = filteredData.map((item: any) => {
                        const val = item[valKey]
                        const pct = ((val - baseVal) / baseVal) * 100
                        if (!isNaN(pct)) maxAbs = Math.max(maxAbs, Math.abs(pct))
                        return {
                            ...item,
                            percentage: pct,
                            displayValue: val // Keep original for tooltip
                        }
                    })

                    setData(processedData)

                    // Adaptive Domain for OI
                    if (type === 'oi') {
                        let limit = maxAbs * 1.25
                        if (limit < 15) limit = 15
                        // Round to nearest 5
                        limit = Math.ceil(limit / 5) * 5
                        setYDomain([-limit, limit])
                    } else {
                        setYDomain(['auto', 'auto'])
                    }

                } else {
                    setData(filteredData)
                    setYDomain(['auto', 'auto'])
                }
            } catch (e) {
                console.error('Error loading static chart data', e)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [type, eventStart, reviewSlug, viewMode, focusWindow, isPercentage, overrideData])

    return {
        data,
        loading,
        yDomain,
        getDateFromDaysDiff
    }
}
