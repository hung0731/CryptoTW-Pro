import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // Test LS with 'timeType' (V3 style) vs 'interval' (V4 style)
        // Test OI with and without exchange_list
        const [lsV4, lsV3, oiV4, oiNoEx] = await Promise.all([
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1
            }),
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                symbol: 'BTC', exchange: 'Binance', timeType: 'h1', limit: 1
            }),
            coinglassV4Request<any[]>('/api/futures/open-interest/ohlc-aggregated-history', {
                symbol: 'BTC', interval: '1d', limit: 2, exchange_list: 'Binance'
            }),
            coinglassV4Request<any[]>('/api/futures/open-interest/ohlc-aggregated-history', {
                symbol: 'BTC', interval: '1d', limit: 2
            })
        ])

        return NextResponse.json({
            lsV4: lsV4 ? 'Matches' : 'Null',
            lsV3: lsV3 ? 'Matches' : 'Null',
            oiV4: oiV4 ? 'Matches' : 'Null',
            oiNoEx: oiNoEx ? 'Matches' : 'Null',

            lsV4Sample: lsV4?.[0],
            lsV3Sample: lsV3?.[0],
            oiV4Sample: oiV4?.[0],
            oiNoExSample: oiNoEx?.[0]
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.toString() }, { status: 500 })
    }
}
