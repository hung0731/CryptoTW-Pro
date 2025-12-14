import { NextRequest, NextResponse } from 'next/server'
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
    const rateLimited = simpleApiRateLimit(req, 'cg-news', 60, 60)
    if (rateLimited) return rateLimited

    try {
        // Check cache first
        const cached = getCache<NewsFlashItem[]>(CACHE_KEY)
        if (cached) {
            console.log('[Cache HIT] coinglass_news')
            return NextResponse.json({ news: cached })
        }

        console.log('[Cache MISS] coinglass_news - fetching fresh data')

        const apiKey = getCoinglassApiKey()

        if (!apiKey) {
            console.error('COINGLASS_API_KEY not configured')
            throw new Error('API Key missing')
        }

        const url = 'https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw'
        const options = {
            method: 'GET',
            headers: { 'CG-API-KEY': apiKey }
        }

        const response = await fetch(url, options)

        if (!response.ok) {
            console.error('Coinglass News API error:', response.status, response.statusText)
            throw new Error(`API returned ${response.status}`)
        }

        const json = await response.json()

        if (json.code !== '0' || !Array.isArray(json.data)) {
            console.warn('Coinglass News API returned error:', json.msg)
            throw new Error(json.msg || 'Invalid response')
        }

        const news: NewsFlashItem[] = json.data.map(mapToNewsFlashItem)

        // Cache for 1 minute
        setCache(CACHE_KEY, news, CacheTTL.FAST)

        return NextResponse.json({ news })

    } catch (error) {
        console.error('News API Error:', error)

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
