import { NextRequest, NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = searchParams.get('limit') || '20'
        const lang = searchParams.get('lang') || 'zh-TW'

        // Coinglass V4 API - News Endpoint
        // Doc: https://open-api-v4.coinglass.com/api/article/list
        const baseUrl = 'https://open-api-v4.coinglass.com/api/article/list'
        const apiKey = process.env.COINGLASS_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 })
        }

        const url = new URL(baseUrl)
        url.searchParams.append('per_page', limit)
        url.searchParams.append('language', lang === 'zh-TW' ? 'zh-tw' : 'en')
        // url.searchParams.append('page', '1') 

        const res = await fetch(url.toString(), {
            headers: {
                'CG-API-KEY': apiKey,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 }
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('[Coinglass News] API Error:', res.status, errText)
            return NextResponse.json({ error: `API Error ${res.status}`, details: errText }, { status: res.status })
        }

        const data = await res.json()

        // Response format: { code: "0", data: [ ... ] }
        const newsList = Array.isArray(data.data) ? data.data : []

        return NextResponse.json({ news: newsList })
    } catch (e) {
        console.error('[Coinglass News] Exception:', e)
        return NextResponse.json({ error: 'Internal Server Error', details: String(e) }, { status: 500 })
    }
}
