import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const apiKey = process.env.COINGLASS_API_KEY
    const headers = { 'CG-API-KEY': apiKey || '', 'Accept': 'application/json' }

    // Testing OI exchange-list variants
    const tests = [
        {
            name: 'OI_ExList_Kebab',
            url: 'https://open-api-v4.coinglass.com/api/futures/open-interest/exchange-list?symbol=BTCUSDT'
        },
        {
            name: 'OI_ExList_Camel',
            url: 'https://open-api-v4.coinglass.com/api/futures/openInterest/exchange-list?symbol=BTCUSDT'
        },
        // Also re-verify Liquidation with BTCUSDT just in case
        {
            name: 'Liq_ExList_Verify',
            url: 'https://open-api-v4.coinglass.com/api/futures/liquidation/aggregated-history?symbol=BTCUSDT&interval=1d&limit=1&exchange_list=Binance'
        }
    ]

    const results: any = {}

    for (const test of tests) {
        try {
            const res = await fetch(test.url, { headers, cache: 'no-store' })
            const text = await res.text()
            let json = null
            try { json = JSON.parse(text) } catch { }

            results[test.name] = {
                status: res.status,
                msg: json?.msg || json?.message || 'none',
                dataSample: Array.isArray(json?.data) ? json.data[0] : (json?.data || 'null_or_empty')
            }
        } catch (e: any) {
            results[test.name] = { error: e.toString() }
        }
    }

    return NextResponse.json(results)
}
