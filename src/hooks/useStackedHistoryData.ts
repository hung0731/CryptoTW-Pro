import { useState, useEffect } from 'react'
import { REVIEWS_DATA } from '@/lib/reviews-data'
import REVIEWS_HISTORY from '@/data/reviews-history.json'

interface UseStackedReviewDataProps {
    leftSlug: string
    rightSlug: string
}

const DD_DOMAIN = [-100, 0]

export function useStackedReviewData({ leftSlug, rightSlug }: UseStackedReviewDataProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewType, setViewType] = useState<'pct' | 'dd' | 'impact'>('pct')
    const [pctDomain, setPctDomain] = useState([-20, 20])
    const [isAsymmetric, setIsAsymmetric] = useState(false)
    const [deathPoints, setDeathPoints] = useState<{ left: any, right: any }>({ left: null, right: null })

    // Helper: Soft Clamp
    const clamp = (val: number | null, min: number, max: number) => {
        if (val === null) return null
        return Math.max(min, Math.min(max, val))
    }

    useEffect(() => {
        const loadData = () => {
            const leftInfo = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === leftSlug)
            const rightInfo = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === rightSlug)

            if (!leftInfo || !rightInfo) {
                setLoading(false)
                return
            }

            const isCollapse = (e: any) => e.reactionType === 'trust_collapse' || e.reactionType === 'liquidity_crisis'
            const leftCollapse = isCollapse(leftInfo)
            const rightCollapse = isCollapse(rightInfo)

            // 0. Outcome Logic
            if (leftCollapse && rightCollapse) {
                setViewType('dd')
                setIsAsymmetric(false)
            } else if (leftCollapse !== rightCollapse) {
                setViewType('impact')
                setIsAsymmetric(true)
            } else {
                setViewType('pct')
                setIsAsymmetric(false)
            }

            // @ts-expect-error: Dynamic property access on imported JSON
            const leftHistory = REVIEWS_HISTORY[`${leftInfo.slug}-${leftInfo.year}`]
            // @ts-expect-error: Dynamic property access on imported JSON
            const rightHistory = REVIEWS_HISTORY[`${rightInfo.slug}-${rightInfo.year}`]

            if (!leftHistory || !rightHistory) {
                setLoading(false)
                return
            }

            // Helper to process a single event history into relative items
            const processHistory = (history: any, eventStart: string, keyPrefix: string) => {
                const priceData = history.price || []
                const start = new Date(eventStart).getTime()
                const oneDay = 1000 * 60 * 60 * 24

                return priceData.map((item: any) => {
                    const current = new Date(item.date).getTime()
                    const diffDays = Math.floor((current - start) / oneDay)
                    return {
                        t: diffDays,
                        [`${keyPrefix}Price`]: item.price,
                        [`${keyPrefix}Date`]: item.date
                    }
                })
            }

            // Normalize data to T-days using REACTION start (D0 = market reaction point)
            const leftSeries = processHistory(leftHistory, leftInfo.reactionStartAt, 'left')
            const rightSeries = processHistory(rightHistory, rightInfo.reactionStartAt, 'right')

            // Merge logic
            const mergedMap = new Map<number, any>()

            // Populate Map
            leftSeries.forEach((item: any) => {
                const existing = mergedMap.get(item.t) || { t: item.t }
                mergedMap.set(item.t, { ...existing, ...item })
            })
            rightSeries.forEach((item: any) => {
                const existing = mergedMap.get(item.t) || { t: item.t }
                mergedMap.set(item.t, { ...existing, ...item })
            })

            const sortedData = Array.from(mergedMap.values())
                .filter(d => {
                    // Default range -45 to +60
                    return d.t >= -45 && d.t <= 60
                })
                .sort((a, b) => a.t - b.t)

            // Normalize Price to % change from T=0
            const leftT0 = leftSeries.find((d: any) => d.t === 0)?.leftPrice || leftSeries.find((d: any) => d.t === 1)?.leftPrice || leftSeries[0].leftPrice
            const rightT0 = rightSeries.find((d: any) => d.t === 0)?.rightPrice || rightSeries.find((d: any) => d.t === 1)?.rightPrice || rightSeries[0].rightPrice

            // Calculate Peaks for Drawdown (Peak-to-Date)
            let leftMax = -Infinity
            let rightMax = -Infinity

            // Domain Tracking
            let minVal = 0
            let maxVal = 0

            // Death Tracking
            let leftDead = false
            let rightDead = false
            let leftDeathPoint: any = null
            let rightDeathPoint: any = null

            // 1. First Pass: Compute Raw Values & Determine Scale & Death
            const rawData = sortedData.map(d => {
                if (d.leftPrice) leftMax = Math.max(leftMax, d.leftPrice)
                if (d.rightPrice) rightMax = Math.max(rightMax, d.rightPrice)

                const leftPct = d.leftPrice ? ((d.leftPrice - leftT0) / leftT0) * 100 : null
                const rightPct = d.rightPrice ? ((d.rightPrice - rightT0) / rightT0) * 100 : null
                const leftDD = d.leftPrice ? ((d.leftPrice - leftMax) / leftMax) * 100 : null
                const rightDD = d.rightPrice ? ((d.rightPrice - rightMax) / rightMax) * 100 : null

                // Death Logic (Cutoff at -90%)
                let finalLeftPct = leftPct
                let finalRightPct = rightPct

                if (leftDead) finalLeftPct = null
                else if (leftPct !== null && leftPct <= -90) {
                    leftDead = true
                    leftDeathPoint = { t: d.t, val: leftPct }
                }

                if (rightDead) finalRightPct = null
                else if (rightPct !== null && rightPct <= -90) {
                    rightDead = true
                    rightDeathPoint = { t: d.t, val: rightPct }
                }

                // Track Min/Max for Adaptive Scale (Only valid points)
                if (finalLeftPct !== null) {
                    minVal = Math.min(minVal, finalLeftPct)
                    maxVal = Math.max(maxVal, finalLeftPct)
                }
                if (finalRightPct !== null) {
                    minVal = Math.min(minVal, finalRightPct)
                    maxVal = Math.max(maxVal, finalRightPct)
                }

                return {
                    ...d,
                    leftPct: finalLeftPct,
                    rightPct: finalRightPct,
                    leftDD,
                    rightDD,
                }
            })

            setDeathPoints({ left: leftDeathPoint, right: rightDeathPoint })

            // 2. Determine Scale & Process Data (Normal or Asymmetric)

            // Asymmetric Impact Normalization
            // Find max impact (absolute) for each valid series
            const leftMaxImpact = Math.max(...rawData.filter(d => d.leftPct !== null).map(d => Math.abs(d.leftPct!))) || 1
            const rightMaxImpact = Math.max(...rawData.filter(d => d.rightPct !== null).map(d => Math.abs(d.rightPct!))) || 1

            // Standard Logic Bounds
            let lowerBound = Math.max(-100, minVal * 1.2)
            let upperBound = Math.max(20, maxVal * 1.2)
            lowerBound = Math.floor(lowerBound / 5) * 5
            upperBound = Math.ceil(upperBound / 5) * 5
            setPctDomain([lowerBound, upperBound])

            const finalData = rawData.map(d => ({
                ...d,
                // Absolute Percentage (Clamped)
                leftPctDisplay: d.leftPct !== null ? clamp(d.leftPct, lowerBound, upperBound) : null,
                rightPctDisplay: d.rightPct !== null ? clamp(d.rightPct, lowerBound, upperBound) : null,

                // Normalized Impact (Raw 0-1ish)
                leftImpactDisplay: d.leftPct !== null ? (d.leftPct / leftMaxImpact) : null,
                rightImpactDisplay: d.rightPct !== null ? (d.rightPct / rightMaxImpact) : null,

                // Drawdown (Clamped)
                leftDDDisplay: clamp(d.leftDD, DD_DOMAIN[0], DD_DOMAIN[1]),
                rightDDDisplay: clamp(d.rightDD, DD_DOMAIN[0], DD_DOMAIN[1])
            }))

            setData(finalData)
            setLoading(false)
        }

        loadData()
    }, [leftSlug, rightSlug])

    return {
        data,
        loading,
        viewType,
        setViewType,
        pctDomain,
        isAsymmetric,
        deathPoints,
        DD_DOMAIN
    }
}
