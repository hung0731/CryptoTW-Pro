import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { NewsFlashItem, getCoinglassApiKey } from '@/lib/coinglass'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const CACHE_KEY = 'coinglass_news'

// Map Coinglass API response to our NewsFlashItem interface
interface CoinglassNewsItem {
    newsflash_title: string
    newsflash_content: string
    newsflash_picture?: string
    newsflash_release_time: number
    source_name: string
    source_website_logo?: string
}

function mapToNewsFlashItem(item: CoinglassNewsItem, index: number): NewsFlashItem {
    return {
        id: `news-${item.newsflash_release_time}-${index}`,
        title: item.newsflash_title,
        content: item.newsflash_content,
        url: '#',
        source: item.source_name,
        createTime: item.newsflash_release_time,
        highlight: false,
        images: item.newsflash_picture ? [item.newsflash_picture] : undefined
    }
}

export async function GET(req: NextRequest) {
    // Rate limit: 60 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(req, 'cg-news', 60, 60)
    if (rateLimited) return rateLimited

    try {
        // Check cache first
        // Check cache first
        const cached = await getCache<NewsFlashItem[]>(CACHE_KEY)
        if (cached) {
            logger.debug('[Cache HIT] coinglass_news', { feature: 'coinglass-api', endpoint: 'news' })
            return NextResponse.json({ news: cached })
        }

        logger.debug('[Cache MISS] coinglass_news - fetching fresh data', { feature: 'coinglass-api', endpoint: 'news' })

        const apiKey = getCoinglassApiKey()

        if (!apiKey) {
            logger.error('COINGLASS_API_KEY not configured', { feature: 'coinglass-api', endpoint: 'news' })
            throw new Error('API Key missing')
        }

        const url = 'https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw'
        const options = {
            method: 'GET',
            headers: { 'CG-API-KEY': apiKey }
        }

        const response = await fetch(url, options)

        if (!response.ok) {
            logger.error('Coinglass News API error', { feature: 'coinglass-api', endpoint: 'news', status: response.status, statusText: response.statusText })
            throw new Error(`API returned ${response.status}`)
        }

        const json = await response.json()

        if (json.code !== '0' || !Array.isArray(json.data)) {
            logger.warn('Coinglass News API returned error', { feature: 'coinglass-api', endpoint: 'news', errorMsg: json.msg })
            throw new Error(json.msg || 'Invalid response')
        }

        const news: NewsFlashItem[] = json.data.map(mapToNewsFlashItem)

        // Cache for 1 minute
        // Cache for 1 minute
        await setCache(CACHE_KEY, news, CacheTTL.FAST)

        return NextResponse.json({ news })

    } catch (error) {
        logger.error('News API Error', error, { feature: 'coinglass-api', endpoint: 'news' })

        const now = Date.now()
        const mockNews: NewsFlashItem[] = [
            {
                id: 'notification-key',
                title: '系統提示：新聞載入失敗',
                content: 'Coinglass 快訊 API 暫時無法連線。請確認 API Key 是否有效，或稍後重新整理頁面。',
                url: '#',
                source: 'System',
                createTime: now,
                highlight: true
            }
        ]
        return NextResponse.json({ news: mockNews })
    }
}
