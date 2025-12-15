import { NextResponse } from 'next/server'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'etf', 'price', 'oi'
    const symbol = searchParams.get('symbol') // 'BTC', 'ETH', 'FTT', 'LUNA'
    const start = searchParams.get('start') // timestamp or 'YYYY-MM-DD'
    const end = searchParams.get('end')     // timestamp or 'YYYY-MM-DD'
    const interval = searchParams.get('interval') || '1d'

    if (!CG_API_KEY) {
        return NextResponse.json({ error: 'API key missing' }, { status: 500 })
    }

    try {
        let data = []
        let processedData = []

        if (type === 'etf') {
            // ONLY BTC
            const res = await fetch(`${CG_BASE}/api/etf/bitcoin/flow-history`, {
                headers: { 'CG-API-KEY': CG_API_KEY },
                next: { revalidate: 3600 } // 1h cache
            })
            const json = await res.json()
            if (json.data) {
                processedData = json.data.map((d: any) => ({
                    date: new Date(d.timestamp).toISOString().split('T')[0],
                    timestamp: d.timestamp,
                    price: d.price_usd,
                    flow: d.flow_usd,
                    cumFlow: d.etf_flows // check if this is cumulative
                }))
            }
        }
        else if (type === 'price') {
            // Use Kline API
            // Coinglass V4 Kline: /api/futures/kline?exchange=Binance&symbol=BTCUSDT&interval=1d&limit=1000
            const pair = symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`
            const res = await fetch(`${CG_BASE}/api/futures/kline?exchange=Binance&symbol=${pair}&interval=${interval}&limit=2000`, {
                headers: { 'CG-API-KEY': CG_API_KEY },
                next: { revalidate: 3600 }
            })
            const json = await res.json()
            // Format: {"t": [time...], "o": [...], "h": [...], "l": [...], "c": [...], "v": [...]}? 
            // OR array of objects? Coinglass kline usually returns object with arrays.

            if (json.data && Array.isArray(json.data)) {
                // Format: { t: number, o: number, c: number ... }
                processedData = json.data.map((d: any) => ({
                    date: new Date(d.t * 1000).toISOString().split('T')[0],
                    timestamp: d.t * 1000,
                    price: d.c,
                    open: d.o,
                    high: d.h,
                    low: d.l
                }))
            } else if (json.data && json.data.t) {
                // Common specialized format
                processedData = json.data.t.map((t: number, i: number) => ({
                    date: new Date(t * 1000).toISOString().split('T')[0],
                    timestamp: t * 1000,
                    price: json.data.c[i],
                    open: json.data.o[i],
                    high: json.data.h[i],
                    low: json.data.l[i]
                }))
            }
        }
        else if (type === 'oi') {
            // Use OI History
            // /api/futures/openInterest/ohlc-history?exchange=Binance&symbol=BTCUSDT&interval=1d
            // Warning: Endpoint might vary. Trying standard V4.
            const pair = symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`
            const res = await fetch(`${CG_BASE}/api/futures/openInterest/ohlc-history?exchange=Binance&symbol=${pair}&interval=${interval}&limit=2000`, {
                headers: { 'CG-API-KEY': CG_API_KEY },
                next: { revalidate: 3600 }
            })
            const json = await res.json()

            if (json.data && Array.isArray(json.data)) {
                processedData = json.data.map((d: any) => ({
                    date: new Date(d.t * 1000).toISOString().split('T')[0],
                    timestamp: d.t * 1000,
                    oi: d.c, // Close OI
                }))
            }
        }

        // Filter by Date Range
        if (start && end) {
            const startDate = new Date(start).getTime()
            const endDate = new Date(end).getTime()
            processedData = processedData.filter((d: any) => d.timestamp >= startDate && d.timestamp <= endDate)
        }

        return NextResponse.json({ data: processedData })

    } catch (e) {
        console.error('Coinglass History API Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
