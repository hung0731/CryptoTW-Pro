import { NextRequest, NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = searchParams.get('limit') || '20'
        const lang = searchParams.get('lang') || 'zh-TW'

        // Attempt to fetch news. Endpoint validation required.
        // Trying /public/v2/news or /article/list
        // Documentation implies /news/list

        // Let's try to fetch using a probable endpoint
        // If this fails, we will see the error in logs (or 404 response)
        const data = await coinglassRequest<any>('/public/v2/news', {
            limit,
            lang
        })

        return NextResponse.json({ news: data || [] })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error', details: String(e) }, { status: 500 })
    }
}
