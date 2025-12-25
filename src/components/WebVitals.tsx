'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect } from 'react'

/**
 * Web Vitals 監控元件
 * - 自動收集 FCP, LCP, CLS, FID, TTFB, INP
 * - 送到 analytics API
 * - 異常值記錄到 console
 */

const THRESHOLDS = {
    FCP: 1800,    // First Contentful Paint
    LCP: 2500,    // Largest Contentful Paint
    FID: 100,     // First Input Delay
    CLS: 0.1,     // Cumulative Layout Shift
    TTFB: 800,    // Time to First Byte
    INP: 200,     // Interaction to Next Paint
}

export function WebVitals() {
    useReportWebVitals((metric) => {
        // 記錄到 console（開發環境）
        if (process.env.NODE_ENV === 'development') {
            const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS]
            const status = threshold && metric.value > threshold ? '❌ POOR' : '✅ GOOD'

            console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms ${status}`, {
                id: metric.id,
                rating: metric.rating,
                navigationType: metric.navigationType,
            })
        }

        // 送到 analytics API（生產環境）
        if (typeof window !== 'undefined') {
            // 使用 sendBeacon 確保在頁面卸載時也能送出
            const body = JSON.stringify({
                name: metric.name,
                value: metric.value,
                rating: metric.rating,
                delta: metric.delta,
                id: metric.id,
                navigationType: metric.navigationType,
                pathname: window.location.pathname,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
            })

            // 非阻塞發送
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/analytics/vitals', body)
            } else {
                fetch('/api/analytics/vitals', {
                    method: 'POST',
                    body,
                    headers: { 'Content-Type': 'application/json' },
                    keepalive: true,
                }).catch(() => {
                    // Silently fail
                })
            }
        }
    })

    // 額外的效能監控
    useEffect(() => {
        if (typeof window === 'undefined') return

        // Navigation Timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navTiming) {
            const dnsTime = navTiming.domainLookupEnd - navTiming.domainLookupStart
            const tcpTime = navTiming.connectEnd - navTiming.connectStart
            const requestTime = navTiming.responseStart - navTiming.requestStart
            const responseTime = navTiming.responseEnd - navTiming.responseStart
            const domParseTime = navTiming.domInteractive - navTiming.responseEnd

            if (process.env.NODE_ENV === 'development') {
                console.log('[Navigation Timing]', {
                    DNS: `${dnsTime.toFixed(0)}ms`,
                    TCP: `${tcpTime.toFixed(0)}ms`,
                    Request: `${requestTime.toFixed(0)}ms`,
                    Response: `${responseTime.toFixed(0)}ms`,
                    'DOM Parse': `${domParseTime.toFixed(0)}ms`,
                })
            }
        }

        // Resource Timing (前 10 個最慢的資源)
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        const slowResources = resources
            .filter(r => r.duration > 100) // 超過 100ms
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10)

        if (slowResources.length > 0 && process.env.NODE_ENV === 'development') {
            console.warn('[Slow Resources]', slowResources.map(r => ({
                name: r.name.split('/').pop(),
                duration: `${r.duration.toFixed(0)}ms`,
                size: `${((r.transferSize || 0) / 1024).toFixed(1)}KB`,
            })))
        }
    }, [])

    return null // 不渲染任何 UI
}
