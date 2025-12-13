export const RSS_URL = 'https://www.panewslab.com/zh/rss/newsflash.xml'

export async function fetchRSSTitles(limit: number = 50): Promise<string> {
    try {
        console.log('Fetching RSS from:', RSS_URL)
        const rssRes = await fetch(RSS_URL, { next: { revalidate: 1800 } })
        if (!rssRes.ok) {
            console.error(`Failed to fetch RSS: ${rssRes.status}`)
            return ''
        }
        const xmlText = await rssRes.text()

        // Simple Regex to extract titles to avoid heavy xml parsers
        const titleMatches = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || []

        const titles = titleMatches
            .map(t => t.replace(/<title><!\[CDATA\[|\]\]><\/title>/g, ''))
            .filter(t => t && !t.includes('PANews')) // Filter out site meta titles if any
            .slice(0, limit)
            .join('\n')

        return titles
    } catch (error) {
        console.error('RSS Fetch Error:', error)
        return ''
    }
}
