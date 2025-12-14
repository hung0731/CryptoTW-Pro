import { NextResponse } from 'next/server'
import { coinglassV4Request, NewsFlashItem } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 min

export async function GET() {
    try {
        const news = await coinglassV4Request<any[]>('/api/newsflash/list', {
            limit: 50,
            lang: 'en'
        })

        if (!news || !Array.isArray(news)) {
            console.warn('Coinglass News API failed or returned invalid data. Returning partial/mock data.')
            const now = Date.now()
            const mockNews: NewsFlashItem[] = [
                {
                    id: 'notification-key',
                    title: 'System Notification: V4 API Key Required',
                    content: 'The current Coinglass API Key appears to be invalid for V4 endpoints (News Flash). Please update your API key to restore live news functionality. Displaying this placeholder to verify layout.',
                    url: 'https://www.coinglass.com/pricing',
                    source: 'System',
                    createTime: now,
                    highlight: true
                },
                {
                    id: 'demo-1',
                    title: 'Bitcoin maintains support above $95,000',
                    content: 'Market data indicates strong support for BTC at the $95k level as institutional inflows continue.',
                    url: '#',
                    source: 'Coinglass (Demo)',
                    createTime: now - 3600000,
                    highlight: false
                }
            ]
            return NextResponse.json({ news: mockNews })
        }

        return NextResponse.json({ news })

    } catch (error) {
        console.error('News API Error:', error)
        return NextResponse.json({ news: [], error: 'Failed to fetch news' }, { status: 500 })
    }
}
