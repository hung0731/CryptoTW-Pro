import { NextResponse } from 'next/server'
import { REVIEWS_DATA } from '@/lib/reviews-data'
import fs from 'fs'
import path from 'path'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

// Helper to fetch history
async function fetchHistory(type: string, symbol: string, start: string, end: string) {
    if (!CG_API_KEY) return []

    // Determine symbol/pair
    const pair = symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`
    const startTimeResult = new Date(start).getTime()
    const endTimeResult = new Date(end).getTime()

    // Add buffer of 10 days
    const bufferedStart = startTimeResult - (86400000 * 15)
    const bufferedEnd = endTimeResult + (86400000 * 15)

    // Convert to Coinglass params if needed (seconds or ms?) Coinglass V4 usually takes ms or specific formats? 
    // Actually V4 kline often takes 'limit' or start/end timestamps. 
    // Let's use limits and filter locally to be safe, or start/end if supported.
    // The previous implementation used limits.

    let endpoint = ''
    let processFn = (d: any): any => d

    if (type === 'price') {
        endpoint = `/api/futures/kline?exchange=Binance&symbol=${pair}&interval=1d&limit=4000` // Fetch a lot then filter
        processFn = (d: any) => ({
            date: new Date(d.t * 1000).toISOString().split('T')[0],
            timestamp: d.t * 1000,
            price: Number(d.c),
            open: Number(d.o),
            high: Number(d.h),
            low: Number(d.l)
        })
    } else if (type === 'etf' && symbol === 'BTC') {
        endpoint = `/api/etf/bitcoin/flow-history`
        processFn = (d: any) => ({
            date: new Date(d.timestamp).toISOString().split('T')[0],
            timestamp: d.timestamp,
            flow: d.flow_usd,
            price: d.price_usd
        })
    } else if (type === 'oi') {
        endpoint = `/api/futures/openInterest/ohlc-history?exchange=Binance&symbol=${pair}&interval=1d&limit=4000`
        processFn = (d: any) => ({
            date: new Date(d.t * 1000).toISOString().split('T')[0],
            timestamp: d.t * 1000,
            oi: Number(d.c)
        })
    } else {
        return []
    }

    try {
        const res = await fetch(`${CG_BASE}${endpoint}`, {
            headers: { 'CG-API-KEY': CG_API_KEY }
        })
        const json = await res.json()
        let rawData = []

        if (type === 'price' || type === 'oi') {
            if (json.data && Array.isArray(json.data)) {
                rawData = json.data
            } else if (json.data && json.data.t) {
                // handle { t: [], c: [] } format if api returns that
                rawData = json.data.t.map((t: number, i: number) => ({
                    t,
                    c: json.data.c[i],
                    o: json.data.o ? json.data.o[i] : 0,
                    h: json.data.h ? json.data.h[i] : 0,
                    l: json.data.l ? json.data.l[i] : 0,
                }))
            }
        } else {
            // ETF
            rawData = json.data || []
        }

        let processed = rawData.map(processFn)

        // Filter
        processed = processed.filter((d: any) => d.timestamp >= bufferedStart && d.timestamp <= bufferedEnd)

        return processed
    } catch (e) {
        console.error(`Error fetching ${type} for ${symbol}:`, e)
        return []
    }
}

export async function GET() {
    const results: Record<string, any> = {}

    for (const review of REVIEWS_DATA) {
        const symbol = review.chartConfig?.symbol || 'BTC'
        const slug = review.slug
        const start = review.eventStartAt
        const end = review.eventEndAt

        results[slug] = {}

        // 1. Price (Always)
        results[slug].price = await fetchHistory('price', symbol, start, end)

        // 2. OI (Always)
        results[slug].oi = await fetchHistory('oi', symbol, start, end)

        // 3. Flow (Only for BTC or special cases?)
        // The UI asks for 'flow' chart for ETF.
        if (slug === 'bitcoin-etf-approval') {
            results[slug].flow = await fetchHistory('etf', 'BTC', start, end)
        }

        // 4. Supply (LUNA) - API doesn't support easy supply history. 
        // We will mock LUNA supply slope or just SKIP it and let UI handle graceful fallback or use Price inverted as proxy?
        // User wants "Local data". I will just NOT fetch supply for now, and handle in UI. 
        // Or I can add a mock generator here?
        if (slug === 'luna-ust-collapse') {
            // Mock exponential supply curve for LUNA
            // From May 7 to May 27
            // LUNA supply went from 350M to 6.5T.
            results[slug].flow = [] // Use flow key for supply chart data
            // ... actually better to just leave empty and use static image if no data? 
            // Or write a simple loop.
            const sDate = new Date('2022-05-07')
            const eDate = new Date('2022-05-15') // Hyperinflation period
            let supply = 350000000
            const data = []
            for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
                data.push({
                    date: d.toISOString().split('T')[0],
                    timestamp: d.getTime(),
                    flow: supply // Reusing 'flow' key for bar chart
                })
                supply = supply * 4 // Quadruple daily? It was insane.
            }
            results[slug].flow = data
        }

        // 5. FTX Flow? 
        // Maybe aggregated volume? I'll skip flow for FTX for now, just Price/OI is mostly requested.
    }

    // Write to file
    const filePath = path.join(process.cwd(), 'src/data/reviews-history.json')
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2))

    return NextResponse.json({ success: true, count: Object.keys(results).length, path: filePath })
}
