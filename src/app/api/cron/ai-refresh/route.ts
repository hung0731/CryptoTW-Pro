import { NextRequest, NextResponse } from 'next/server'
import { generateMarketContextBrief } from '@/lib/ai'
import { generateAIDecision } from '@/lib/ai'
import { generateIndicatorSummary } from '@/lib/ai'
import { setCache, CacheTTL } from '@/lib/cache'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for generation

// Cron secret for security (set in Vercel environment)
const CRON_SECRET = process.env.CRON_SECRET || 'cryptotw-cron-secret'

/**
 * Background AI Pre-generation Endpoint
 * 
 * Usage:
 * - Local: curl "http://localhost:3000/api/cron/ai-refresh?secret=cryptotw-cron-secret"
 * - Vercel Cron: Set up in vercel.json to run every 10 minutes
 * 
 * This pre-generates AI content in the background so users get instant responses.
 */
export async function GET(req: NextRequest) {
    // Verify cron secret
    const secret = req.nextUrl.searchParams.get('secret')
    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    const results: Record<string, boolean> = {}

    try {
        logger.info('[CRON] Starting AI pre-generation...', { feature: 'cron' })

        // 1. Fetch market news from Coinglass
        const apiKey = process.env.COINGLASS_API_KEY
        if (!apiKey) {
            throw new Error('COINGLASS_API_KEY not configured')
        }

        const [newsRes, fgiRes, frRes] = await Promise.all([
            fetch('https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/index/fear-greed-history', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/futures/funding-rate/vol?symbol=BTC&type=U', { headers: { 'CG-API-KEY': apiKey } })
        ])

        const newsJson = newsRes.ok ? await newsRes.json() : null
        const fgiJson = fgiRes.ok ? await fgiRes.json() : null
        const frJson = frRes.ok ? await frRes.json() : null

        const newsItems = newsJson?.data || []
        const indicators = {
            fgi: fgiJson?.data?.[0]?.values?.[0]?.value || null,
            fundingRate: frJson?.data?.[0]?.rate || null
        }

        // 2. Generate Market Context (parallel)
        const marketContextPromise = generateMarketContextBrief(newsItems, indicators)
            .then(async (context) => {
                if (context) {
                    await setCache('market_context_v4', context, CacheTTL.SLOW)
                    logger.info('[CRON] Market Context generated and cached', { feature: 'cron' })
                    return true
                }
                return false
            })
            .catch((e) => {
                logger.error('[CRON] Market Context failed', e, { feature: 'cron' })
                return false
            })

        // Wait for all generations
        results.marketContext = await marketContextPromise

        const elapsed = Date.now() - startTime
        logger.info(`[CRON] AI pre-generation complete in ${elapsed}ms`, { feature: 'cron', results })

        return NextResponse.json({
            success: true,
            message: 'AI content pre-generated successfully',
            results,
            elapsed: `${elapsed}ms`
        })

    } catch (error) {
        logger.error('[CRON] AI pre-generation error', error, { feature: 'cron' })
        return NextResponse.json({
            success: false,
            error: String(error),
            results
        }, { status: 500 })
    }
}
