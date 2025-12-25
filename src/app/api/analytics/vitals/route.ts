import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Web Vitals Analytics Endpoint
 * 接收 Web Vitals 數據並記錄
 */

interface WebVitalMetric {
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    delta: number
    id: string
    navigationType?: string
    pathname: string
    timestamp: number
    userAgent: string
}

export async function POST(request: NextRequest) {
    try {
        const metric: WebVitalMetric = await request.json()

        // 記錄到 logger
        logger.info('Web Vitals', {
            feature: 'analytics',
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            pathname: metric.pathname,
            navigationType: metric.navigationType,
        })

        // 如果是異常值，額外記錄警告
        const THRESHOLDS: Record<string, number> = {
            FCP: 1800,
            LCP: 2500,
            FID: 100,
            CLS: 0.1,
            TTFB: 800,
            INP: 200,
        }

        const threshold = THRESHOLDS[metric.name]
        if (threshold && metric.value > threshold) {
            logger.warn('Poor Web Vital detected', {
                feature: 'analytics',
                metric: metric.name,
                value: metric.value,
                threshold,
                pathname: metric.pathname,
                userAgent: metric.userAgent,
            })
        }

        // 未來可以送到外部 analytics（如 Google Analytics、Mixpanel）
        // gtag('event', metric.name, {
        //   value: Math.round(metric.value),
        //   metric_rating: metric.rating,
        //   page_path: metric.pathname,
        // })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        logger.error('Failed to process Web Vitals', error as Error, {
            feature: 'analytics',
        })
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
