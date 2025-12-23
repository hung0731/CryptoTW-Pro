export const RSS_URL = 'https://www.panewslab.com/zh/rss/newsflash.xml'
import { logger } from '@/lib/logger'

export async function fetchRSSTitles(limit: number = 30): Promise<string> {
    try {
        logger.debug('Fetching RSS from:', { feature: 'rss', url: RSS_URL })
        const rssRes = await fetch(RSS_URL, { next: { revalidate: 300 } }) // Lower cache time to 5m for "News Flash"
        if (!rssRes.ok) {
            logger.error(`Failed to fetch RSS: ${rssRes.status}`, new Error('RSS fetch failed'), { feature: 'rss', status: rssRes.status })
            return ''
        }
        const xmlText = await rssRes.text()

        // Extract items using regex to get both title and description
        // Matches <item>...</item> block
        const itemRegex = /<item>([\s\S]*?)<\/item>/g
        const items = []
        let match

        while ((match = itemRegex.exec(xmlText)) !== null) {
            if (items.length >= limit) break
            const itemContent = match[1]

            // Extract Title
            const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemContent.match(/<title>(.*?)<\/title>/)
            const title = titleMatch ? titleMatch[1] : ''

            // Extract Description
            const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemContent.match(/<description>(.*?)<\/description>/)
            let desc = descMatch ? descMatch[1] : ''

            // Clean HTML tags from description if any
            desc = desc.replace(/<[^>]*>?/gm, '')

            if (title) {
                items.push(`標題: ${title}\n內文: ${desc.slice(0, 150)}...`) // Limit description length
            }
        }

        return items.join('\n\n')
    } catch (error) {
        logger.error('RSS Fetch Error:', error as Error, { feature: 'rss' })
        return ''
    }
}
