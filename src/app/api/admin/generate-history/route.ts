import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const maxDuration = 300 // Allow 5 minutes for this operation

const API_KEY = process.env.COINGLASS_API_KEY
const BASE_URL = 'https://open-api-v4.coinglass.com'

// ----------------------------------------------------------------------------
// Configuration (Synced with scripts/fetch-history.js)
// ----------------------------------------------------------------------------
const REVIEWS_CONFIG = [
    // S-Class Events
    {
        slug: 'etf',
        year: 2024,
        symbol: 'BTC',
        reactionStart: '2024-01-10',
        types: ['price', 'flow', 'oi', 'premium']
    },
    {
        slug: 'ftx',
        year: 2022,
        symbol: 'FTT',
        reactionStart: '2022-11-08',
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'luna',
        year: 2022,
        symbol: 'LUNA',
        reactionStart: '2022-05-09',
        types: ['price', 'flow', 'fgi']
    },
    {
        slug: 'covid',
        year: 2020,
        symbol: 'BTC',
        reactionStart: '2020-03-09',
        types: ['price', 'oi', 'fgi', 'liquidation']
    },
    {
        slug: 'mtgox',
        year: 2014,
        symbol: 'BTC',
        reactionStart: '2014-02-07',
        types: ['price']
    },
    {
        slug: 'dao',
        year: 2016,
        symbol: 'ETH',
        reactionStart: '2016-06-17',
        types: ['price']
    },
    // A-Class Events
    {
        slug: 'ico',
        year: 2017,
        symbol: 'ETH',
        reactionStart: '2017-12-17',
        types: ['price', 'oi']
    },
    {
        slug: 'china-ban',
        year: 2021,
        symbol: 'BTC',
        reactionStart: '2021-05-19',
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'the-merge',
        year: 2022,
        symbol: 'ETH',
        reactionStart: '2022-09-15',
        types: ['price', 'oi']
    },
    // Bitcoin Halvings
    {
        slug: 'halving',
        year: 2012,
        symbol: 'BTC',
        reactionStart: '2012-11-28',
        types: ['price']
    },
    {
        slug: 'halving',
        year: 2016,
        symbol: 'BTC',
        reactionStart: '2016-07-09',
        types: ['price']
    },
    {
        slug: 'halving',
        year: 2020,
        symbol: 'BTC',
        reactionStart: '2020-05-11',
        types: ['price', 'oi']
    },
    {
        slug: 'halving',
        year: 2024,
        symbol: 'BTC',
        reactionStart: '2024-04-20',
        types: ['price', 'flow', 'oi']
    },
    // New Events
    {
        slug: 'defi-summer',
        year: 2020,
        symbol: 'ETH',
        reactionStart: '2020-06-15',
        types: ['price', 'oi']
    },
    {
        slug: 'tesla',
        year: 2021,
        symbol: 'BTC',
        reactionStart: '2021-02-08',
        types: ['price', 'oi']
    },
    {
        slug: 'coinbase',
        year: 2021,
        symbol: 'BTC',
        reactionStart: '2021-04-14',
        types: ['price', 'oi']
    },
    {
        slug: 'el-salvador',
        year: 2021,
        symbol: 'BTC',
        reactionStart: '2021-09-07',
        types: ['price', 'oi']
    },
    {
        slug: 'celsius',
        year: 2022,
        symbol: 'BTC',
        reactionStart: '2022-06-12',
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: '3ac',
        year: 2022,
        symbol: 'BTC',
        reactionStart: '2022-06-15',
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'sec-coinbase',
        year: 2023,
        symbol: 'BTC',
        reactionStart: '2023-06-06',
        types: ['price', 'oi']
    },
    {
        slug: 'xrp-ruling',
        year: 2023,
        symbol: 'BTC',
        reactionStart: '2023-07-13',
        types: ['price', 'oi']
    },
    {
        slug: 'cz',
        year: 2023,
        symbol: 'BTC',
        reactionStart: '2023-11-21',
        types: ['price', 'oi']
    },
    // 2024 New Events
    {
        slug: 'yen-carry',
        year: 2024,
        symbol: 'BTC',
        reactionStart: '2024-08-05',
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'german-selloff',
        year: 2024,
        symbol: 'BTC',
        reactionStart: '2024-07-08',
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'iran-conflict',
        year: 2024,
        symbol: 'BTC',
        reactionStart: '2024-04-13',
        types: ['price', 'oi', 'fgi']
    },
    // New Indicator-Related Events
    {
        slug: '2021-may-crash',
        year: 2021,
        symbol: 'BTC',
        reactionStart: '2021-05-12',
        types: ['price', 'oi', 'fgi', 'funding', 'liquidation', 'longShort']
    },
    {
        slug: '2024-ath-pullback',
        year: 2024,
        symbol: 'BTC',
        reactionStart: '2024-03-14',
        types: ['price', 'oi', 'fgi', 'funding']
    },
    {
        slug: '2021-nov-top',
        year: 2021,
        symbol: 'BTC',
        reactionStart: '2021-11-10',
        types: ['price', 'oi', 'fgi', 'basis']
    },
    {
        slug: '2022-june-deleverage',
        year: 2022,
        symbol: 'BTC',
        reactionStart: '2022-06-12',
        types: ['price', 'oi', 'fgi', 'stablecoin']
    },
    {
        slug: '2023-march-squeeze',
        year: 2023,
        symbol: 'BTC',
        reactionStart: '2023-03-10',
        types: ['price', 'oi', 'fgi', 'longShort']
    }
]

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

async function fetchApi(endpoint: string) {
    try {
        await new Promise(resolve => setTimeout(resolve, 3500)) // Rate limit protection
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`
        const headers: Record<string, string> = {
            'User-Agent': 'CryptoTW-Admin/1.0',
            'Accept': 'application/json'
        }
        if (API_KEY) {
            headers['CG-API-KEY'] = API_KEY
        }

        const res = await fetch(url, { headers })
        if (!res.ok) {
            console.warn(`    Req Failed: ${res.status} ${res.statusText}`)
            return null
        }
        return await res.json()
    } catch (e: any) {
        console.error(`    Fetch Error: ${e.message}`)
        return null
    }
}

function fetchFromCSV(startMs: number, endMs: number) {
    const csvPath = path.join(process.cwd(), 'INDEX_BTCUSD, 1D (1).csv')
    if (!fs.existsSync(csvPath)) {
        console.warn('    CSV file not found:', csvPath)
        return []
    }

    console.log('  Reading from CSV file...')
    const content = fs.readFileSync(csvPath, 'utf-8')
    const lines = content.split('\n').slice(1)

    const data = []
    for (const line of lines) {
        if (!line.trim()) continue
        const [time, open, high, low, close] = line.split(',')
        const timestamp = parseInt(time) * 1000

        if (timestamp >= startMs && timestamp <= endMs) {
            data.push({
                date: new Date(timestamp).toISOString().split('T')[0],
                timestamp,
                price: parseFloat(close)
            })
        }
    }
    return data
}

async function fetchHistory(type: string, symbol: string, reactionStartStr: string) {
    const reactionStart = new Date(reactionStartStr)
    // Buffer 60 days
    const bufferedStart = new Date(reactionStart); bufferedStart.setDate(reactionStart.getDate() - 60)
    const bufferedEnd = new Date(reactionStart); bufferedEnd.setDate(reactionStart.getDate() + 60)

    const startMs = bufferedStart.getTime()
    const endMs = bufferedEnd.getTime()
    const pair = symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`

    if (type === 'price') {
        const year = reactionStart.getFullYear()
        if (year < 2017) {
            return fetchFromCSV(startMs, endMs)
        }
        // Binance for 2017+
        const endpoint = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1d&startTime=${startMs}&endTime=${endMs}&limit=1000`
        try {
            const res = await fetch(endpoint)
            const json = await res.json()
            if (!Array.isArray(json)) return []
            return json.map((d: any) => ({
                date: new Date(d[0]).toISOString().split('T')[0],
                timestamp: d[0],
                price: parseFloat(d[4])
            }))
        } catch (e) { return [] }
    }

    if (type === 'flow' && symbol === 'BTC') {
        const endpoint = `https://open-api-v4.coinglass.com/api/etf/bitcoin/flow-history`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && Array.isArray(json.data)) {
            return json.data.map((d: any) => ({
                date: new Date(d.timestamp).toISOString().split('T')[0],
                timestamp: d.timestamp,
                flow: d.flow_usd || 0,
                price: d.price_usd || 0
            })).filter((d: any) => d.timestamp >= startMs && d.timestamp <= endMs)
        }
        return []
    }

    if (type === 'oi') {
        const startSec = Math.floor(startMs / 1000)
        const endSec = Math.floor(endMs / 1000)
        const endpoint = `https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history?symbol=${symbol}&interval=1d&startTime=${startSec}&endTime=${endSec}`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && Array.isArray(json.data)) {
            return json.data.map((d: any) => ({
                date: new Date(d.t * 1000).toISOString().split('T')[0],
                timestamp: d.t * 1000,
                oi: parseFloat(d.c)
            }))
        }
        return []
    }

    if (type === 'fgi') {
        const endpoint = 'https://open-api-v3.coinglass.com/api/index/fear-greed-history'
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data) {
            const { dates, values } = json.data
            const mapped = []
            for (let i = 0; i < dates.length; i++) {
                const ts = dates[i]
                if (ts >= startMs && ts <= endMs) {
                    mapped.push({
                        date: new Date(ts).toISOString().split('T')[0],
                        timestamp: ts,
                        fgi: values[i]
                    })
                }
            }
            return mapped
        }
        return []
    }

    if (type === 'funding') {
        const endpoint = `https://open-api-v4.coinglass.com/api/futures/funding-rate/oi-weight-history?symbol=${symbol}&interval=1d&start_time=${startMs}&end_time=${endMs}`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data) {
            return json.data.map((item: any) => ({
                date: new Date(item.time).toISOString().split('T')[0],
                timestamp: item.time,
                fundingRate: parseFloat(item.close) * 100
            })).filter((d: any) => d.timestamp >= startMs && d.timestamp <= endMs)
        }
        return []
    }

    if (type === 'liquidation') {
        const endpoint = `https://open-api-v4.coinglass.com/api/futures/liquidation/history?exchange=Binance&symbol=${pair}&interval=1d&start_time=${startMs}&end_time=${endMs}`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data) {
            return json.data.map((item: any) => ({
                date: new Date(item.time).toISOString().split('T')[0],
                timestamp: item.time,
                liquidation: parseFloat(item.long_liquidation_usd) + parseFloat(item.short_liquidation_usd)
            })).filter((d: any) => d.timestamp >= startMs && d.timestamp <= endMs)
        }
        return []
    }

    if (type === 'longShort') {
        const endpoint = `https://open-api-v4.coinglass.com/api/futures/global-long-short-account-ratio/history?exchange=Binance&symbol=${pair}&interval=1d&start_time=${startMs}&end_time=${endMs}`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data) {
            return json.data.map((item: any) => ({
                date: new Date(item.time).toISOString().split('T')[0],
                timestamp: item.time,
                longShortRatio: parseFloat(item.global_account_long_short_ratio)
            })).filter((d: any) => d.timestamp >= startMs && d.timestamp <= endMs)
        }
        return []
    }

    if (type === 'basis') {
        const endpoint = `https://open-api-v4.coinglass.com/api/futures/basis/history?exchange=Binance&symbol=${pair}&interval=1d&start_time=${startMs}&end_time=${endMs}`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data) {
            return json.data.map((item: any) => ({
                date: new Date(item.time).toISOString().split('T')[0],
                timestamp: item.time,
                basis: parseFloat(item.close_basis) * 100
            }))
        }
        return []
    }

    if (type === 'premium') {
        const endpoint = `https://open-api-v4.coinglass.com/api/coinbase-premium-index?interval=1d&start_time=${startMs}&end_time=${endMs}`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data) {
            return json.data.map((item: any) => ({
                date: new Date(item.time * 1000).toISOString().split('T')[0],
                timestamp: item.time * 1000,
                premium: parseFloat(item.premium_rate)
            }))
        }
        return []
    }

    if (type === 'stablecoin') {
        const endpoint = `https://open-api-v4.coinglass.com/api/index/stableCoin-marketCap-history`
        const json = await fetchApi(endpoint)
        if (json?.code === '0' && json.data && json.data[0]) {
            const d = json.data[0]
            return d.time_list.map((t: number, i: number) => ({
                date: new Date(t * 1000).toISOString().split('T')[0],
                timestamp: t * 1000,
                stablecoin: d.data_list[i]
            })).filter((x: any) => x.timestamp >= startMs && x.timestamp <= endMs)
        }
        return []
    }

    return []
}

import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

// ----------------------------------------------------------------------------
// POST Handler
// ----------------------------------------------------------------------------
export async function POST() {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    if (!API_KEY) {
        return NextResponse.json({ error: 'COINGLASS_API_KEY is missing' }, { status: 500 })
    }

    const output: Record<string, any> = {}
    const logs: string[] = []

    try {
        for (const conf of REVIEWS_CONFIG) {
            logs.push(`Processing ${conf.slug} (${conf.year})...`)
            const key = `${conf.slug}-${conf.year}`
            output[key] = {} as any

            for (const type of conf.types) {
                // Mock LUNA Supply
                if (conf.slug === 'luna' && type === 'flow') {
                    const sDate = new Date('2022-03-01')
                    const eDate = new Date('2022-07-01')
                    let supply = 350000000
                    const mockData = []
                    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
                        mockData.push({
                            date: d.toISOString().split('T')[0],
                            timestamp: d.getTime(),
                            flow: supply
                        })
                        if (d > new Date('2022-05-08')) supply = supply * 3
                    }
                    output[key][type] = mockData
                    continue
                }

                // Standard Fetch
                const data = await fetchHistory(type, conf.symbol, conf.reactionStart)
                output[key][type] = data || []
            }
        }

        const outputPath = path.join(process.cwd(), 'src/data/reviews-history.json')
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

        return NextResponse.json({
            success: true,
            msg: `Data written to ${outputPath}`,
            logs
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

