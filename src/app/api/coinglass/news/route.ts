import { NextResponse } from 'next/server'
import { coinglassV4Request, NewsFlashItem } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 min

export async function GET() {
    try {
        // Fetch news flash list
        const news = await coinglassV4Request<NewsFlashItem[]>('/api/newsflash/list', {
            limit: 50,  // Fetch reasonable amount
            lang: 'en'  // Enforce English content if necessary, or check API default
        })

        if (!news || !Array.isArray(news)) {
            return NextResponse.json({ news: [] })
        }

        return NextResponse.json({ news })

    } catch (error) {
        console.error('News API Error:', error)
        return NextResponse.json({ news: [], error: 'Failed to fetch news' }, { status: 500 })
    }
}
