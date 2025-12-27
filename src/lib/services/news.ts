import { logger } from '@/lib/logger'
import { generateMarketContextBrief } from '@/lib/ai'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { coinglassV4Request } from '@/lib/coinglass'
import { MarketContext } from '@/lib/types'
import { CACHE_KEYS } from '@/lib/cache-keys'

export class NewsService {
    static async getMarketContext(): Promise<MarketContext | null> {
        try {
            // Check cache first
            const cached = await getCache<MarketContext>(CACHE_KEYS.MARKET_CONTEXT)
            if (cached) {
                logger.info('[Cache HIT] Market Context (Service)', { feature: 'news-service' })
                return cached
            }

            logger.info('[Cache MISS] market_context - generating fresh AI context', { feature: 'news-service' })

            // Fetch news from Coinglass via helper
            // Note: coinglassV4Request handles errors, base URL and API key internally
            const newsItems = await coinglassV4Request<any[]>('/api/newsflash/list', {
                language: 'zh-tw',
                limit: 20
            })

            if (!newsItems || newsItems.length === 0) {
                logger.warn('No news items found from Coinglass', { feature: 'news-service' })
                return null
            }

            // Generate AI context
            const context = await generateMarketContextBrief(newsItems)

            if (!context) {
                logger.error('AI generation failed for news context', { feature: 'news-service' })
                return null
            }

            // Cache the result
            await setCache(CACHE_KEYS.MARKET_CONTEXT, context, CacheTTL.SLOW) // 15 min

            return context

        } catch (error) {
            logger.error('NewsService Error', error as Error, { feature: 'news-service' })
            return null
        }
    }
}
