import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const CACHE_KEY = 'api:bull-bear'

// Bull/Bear Index: Now uses Coinglass Fear & Greed (V4)
export async function GET(req: NextRequest) {
    // Rate limit: 60 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(req, 'cg-bullbear', 60, 60)
    if (rateLimited) return rateLimited

    try {
        // Check cache first (5 min)
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const data = await coinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 1 })

        if (!data || data.length === 0) {
            throw new Error('No data returned')
        }

        const latest = data[0]
        const index = latest.value
        const sentiment = getSentiment(index)

        const result = {
            bullBear: {
                index: index,
                sentiment: sentiment.label,
                sentimentCn: sentiment.labelCn,
                color: sentiment.color,
                suggestion: sentiment.suggestion,
                components: {
                    // Mock components since we use a composite index now
                    funding: { score: index, weight: 33 },
                    longShort: { score: index, weight: 33 },
                    oi: { score: index, weight: 34 }
                },
                change24h: 0,
                lastUpdated: new Date(latest.time || Date.now()).toISOString()
            }
        }

        // Cache for 5 minutes
        await setCache(CACHE_KEY, result, CacheTTL.MEDIUM)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (error) {
        logger.error('Bull/Bear API error', error, { feature: 'coinglass-api', endpoint: 'bull-bear' })
        return NextResponse.json({
            error: 'Internal server error',
            bullBear: getDemoData() // Fallback
        })
    }
}

function getSentiment(index: number): {
    label: string,
    labelCn: string,
    color: string,
    suggestion: string
} {
    if (index >= 75) {
        return {
            label: 'Extreme Greed',
            labelCn: '極度貪婪',
            color: 'red',
            suggestion: '市場過熱，高位追多風險大，建議減倉或觀望'
        }
    }
    if (index >= 55) {
        return {
            label: 'Greed',
            labelCn: '貪婪',
            color: 'orange',
            suggestion: '市場偏多，但需注意回調風險'
        }
    }
    if (index >= 45) {
        return {
            label: 'Neutral',
            labelCn: '中性',
            color: 'gray',
            suggestion: '市場情緒中性，可根據技術面操作'
        }
    }
    if (index >= 25) {
        return {
            label: 'Fear',
            labelCn: '恐懼',
            color: 'blue',
            suggestion: '市場偏空，可能是逢低買入機會'
        }
    }
    return {
        label: 'Extreme Fear',
        labelCn: '極度恐懼',
        color: 'green',
        suggestion: '市場極度恐慌，歷史上是最佳買點'
    }
}

function getDemoData() {
    return {
        index: 50,
        sentiment: 'Neutral',
        sentimentCn: '中性',
        color: 'gray',
        suggestion: '數據暫時無法獲取，請稍後再試',
        components: {
            funding: { score: 50, weight: 33 },
            longShort: { score: 50, weight: 33 },
            oi: { score: 50, weight: 34 }
        },
        change24h: 0,
        lastUpdated: new Date().toISOString()
    }
}
