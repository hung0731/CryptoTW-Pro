#!/usr/bin/env node

/**
 * Fetch BTC Price Reactions for Macro Events
 * 
 * This script fetches BTC OHLC data around each macro event occurrence
 * and calculates the D+1, D+3, MaxDD, MaxUp, and Range statistics.
 * 
 * Usage: node scripts/fetch-macro-reactions.js
 * Output: src/data/macro-reactions.json
 */

const fs = require('fs')

const BINANCE_API = 'https://api.binance.com/api/v3/klines'

// Import occurrences from macro-events.ts (simplified version for script)
const PAST_EVENTS = [
    // CPI 2025 (past occurrences only)
    { eventKey: 'cpi', occursAt: '2025-12-18T13:30:00Z' }, // Nov 2025 CPI (Delayed)
    { eventKey: 'cpi', occursAt: '2025-10-15T12:30:00Z' }, // Sep 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-09-11T12:30:00Z' }, // Aug 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-08-12T12:30:00Z' }, // Jul 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-07-10T12:30:00Z' }, // Jun 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-06-11T12:30:00Z' }, // May 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-05-13T12:30:00Z' }, // Apr 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-04-10T12:30:00Z' }, // Mar 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-03-12T12:30:00Z' }, // Feb 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-02-12T13:30:00Z' }, // Jan 2025 CPI
    { eventKey: 'cpi', occursAt: '2025-01-15T13:30:00Z' }, // Dec 2024 CPI
    // CPI 2024
    { eventKey: 'cpi', occursAt: '2024-12-11T13:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-11-13T13:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-10-10T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-09-11T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-08-14T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-07-11T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-06-12T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-05-15T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-04-10T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-03-12T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-02-13T13:30:00Z' },
    { eventKey: 'cpi', occursAt: '2024-01-11T13:30:00Z' },
    // CPI 2023
    { eventKey: 'cpi', occursAt: '2023-12-12T13:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-11-14T13:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-10-12T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-09-13T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-08-10T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-07-12T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-06-13T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-05-10T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-04-12T12:30:00Z' },
    { eventKey: 'cpi', occursAt: '2023-03-14T12:30:00Z' },
    // NFP 2025 (past occurrences only)
    { eventKey: 'nfp', occursAt: '2025-12-05T13:30:00Z' }, // Nov 2025
    { eventKey: 'nfp', occursAt: '2025-10-03T12:30:00Z' }, // Sep 2025
    { eventKey: 'nfp', occursAt: '2025-09-05T12:30:00Z' }, // Aug 2025
    { eventKey: 'nfp', occursAt: '2025-08-01T12:30:00Z' }, // Jul 2025
    { eventKey: 'nfp', occursAt: '2025-07-03T12:30:00Z' }, // Jun 2025
    { eventKey: 'nfp', occursAt: '2025-06-06T12:30:00Z' }, // May 2025
    { eventKey: 'nfp', occursAt: '2025-05-02T12:30:00Z' }, // Apr 2025
    { eventKey: 'nfp', occursAt: '2025-04-04T12:30:00Z' }, // Mar 2025
    { eventKey: 'nfp', occursAt: '2025-03-07T13:30:00Z' }, // Feb 2025
    { eventKey: 'nfp', occursAt: '2025-02-07T13:30:00Z' }, // Jan 2025
    { eventKey: 'nfp', occursAt: '2025-01-10T13:30:00Z' }, // Dec 2024
    // NFP 2024
    { eventKey: 'nfp', occursAt: '2024-12-06T13:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-11-01T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-10-04T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-09-06T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-08-02T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-07-05T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-06-07T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-05-03T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-04-05T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-03-08T13:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-02-02T13:30:00Z' },
    { eventKey: 'nfp', occursAt: '2024-01-05T13:30:00Z' },
    // NFP 2023
    { eventKey: 'nfp', occursAt: '2023-12-08T13:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-11-03T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-10-06T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-09-01T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-08-04T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-07-07T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-06-02T12:30:00Z' },
    { eventKey: 'nfp', occursAt: '2023-05-05T12:30:00Z' },
    // FOMC 2025 (past occurrences only)
    { eventKey: 'fomc', occursAt: '2025-12-10T19:00:00Z' }, // Dec 9-10
    { eventKey: 'fomc', occursAt: '2025-10-29T18:00:00Z' }, // Oct 28-29
    { eventKey: 'fomc', occursAt: '2025-09-17T18:00:00Z' }, // Sep 16-17
    { eventKey: 'fomc', occursAt: '2025-07-30T18:00:00Z' }, // Jul 29-30
    { eventKey: 'fomc', occursAt: '2025-06-18T18:00:00Z' }, // Jun 17-18
    { eventKey: 'fomc', occursAt: '2025-05-07T18:00:00Z' }, // May 6-7
    { eventKey: 'fomc', occursAt: '2025-03-19T18:00:00Z' }, // Mar 18-19
    { eventKey: 'fomc', occursAt: '2025-01-29T19:00:00Z' }, // Jan 28-29
    // FOMC 2024
    { eventKey: 'fomc', occursAt: '2024-12-18T19:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-11-07T19:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-09-18T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-07-31T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-06-12T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-05-01T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-03-20T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2024-01-31T19:00:00Z' },
    // FOMC 2023
    { eventKey: 'fomc', occursAt: '2023-12-13T19:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-11-01T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-09-20T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-07-26T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-06-14T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-05-03T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-03-22T18:00:00Z' },
    { eventKey: 'fomc', occursAt: '2023-02-01T19:00:00Z' },
]

// Fetch daily OHLC from Binance
async function fetchDailyOHLC(symbol, startTime, endTime) {
    const url = `${BINANCE_API}?symbol=${symbol}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=15`

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        return data.map(k => ({
            date: new Date(k[0]).toISOString().split('T')[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
        }))
    } catch (err) {
        console.error(`Failed to fetch OHLC: ${err.message}`)
        return []
    }
}

// Calculate event reaction stats
function calculateStats(ohlc, d0Index) {
    if (d0Index < 0 || d0Index >= ohlc.length) return null

    const d0 = ohlc[d0Index]
    const d1 = ohlc[d0Index + 1]
    const d3 = ohlc[d0Index + 3]

    if (!d0 || !d1) return null

    const d0Close = d0.close

    // D0→D+1 Return
    const d0d1Return = d1 ? ((d1.close - d0Close) / d0Close * 100) : null

    // D0→D+3 Return
    const d0d3Return = d3 ? ((d3.close - d0Close) / d0Close * 100) : null

    // Max Drawdown and Max Upside within D0~D+3
    let maxDD = 0
    let maxUp = 0
    let rangeHigh = d0.high
    let rangeLow = d0.low

    for (let i = d0Index; i <= Math.min(d0Index + 3, ohlc.length - 1); i++) {
        const candle = ohlc[i]
        const lowPct = (candle.low - d0Close) / d0Close * 100
        const highPct = (candle.high - d0Close) / d0Close * 100

        if (lowPct < maxDD) maxDD = lowPct
        if (highPct > maxUp) maxUp = highPct

        if (candle.high > rangeHigh) rangeHigh = candle.high
        if (candle.low < rangeLow) rangeLow = candle.low
    }

    const range = (rangeHigh - rangeLow) / d0Close * 100

    // Direction
    let direction = 'chop'
    if (d0d1Return !== null) {
        if (d0d1Return > 1) direction = 'up'
        else if (d0d1Return < -1) direction = 'down'
    }

    return {
        d0d1Return: d0d1Return ? Math.round(d0d1Return * 100) / 100 : null,
        d0d3Return: d0d3Return ? Math.round(d0d3Return * 100) / 100 : null,
        maxDrawdown: Math.round(maxDD * 100) / 100,
        maxUpside: Math.round(maxUp * 100) / 100,
        range: Math.round(range * 100) / 100,
        direction,
    }
}

async function main() {
    console.log('🚀 Fetching BTC price reactions for macro events...\n')

    const results = {}
    let successCount = 0
    let failCount = 0

    for (const occ of PAST_EVENTS) {
        const eventDate = new Date(occ.occursAt)
        const dateStr = eventDate.toISOString().split('T')[0]

        // Fetch D-5 to D+5 (11 days)
        const startTime = eventDate.getTime() - 5 * 24 * 60 * 60 * 1000
        const endTime = eventDate.getTime() + 6 * 24 * 60 * 60 * 1000

        process.stdout.write(`📊 ${occ.eventKey.toUpperCase().padEnd(4)} ${dateStr}... `)

        const ohlc = await fetchDailyOHLC('BTCUSDT', startTime, endTime)

        if (ohlc.length === 0) {
            console.log(`⚠️ No data`)
            failCount++
            continue
        }

        // Find D0 index
        let d0Index = ohlc.findIndex(c => c.date === dateStr)
        if (d0Index < 0) {
            // Try next day (weekend/holiday adjustment)
            const nextDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            d0Index = ohlc.findIndex(c => c.date === nextDate)
            if (d0Index < 0) {
                console.log(`⚠️ D0 not found`)
                failCount++
                continue
            }
        }

        const stats = calculateStats(ohlc, d0Index)

        if (stats) {
            const key = `${occ.eventKey}-${dateStr}`
            results[key] = {
                eventKey: occ.eventKey,
                occursAt: occ.occursAt,
                stats,
                priceData: ohlc.slice(Math.max(0, d0Index - 3), d0Index + 4).map(c => ({
                    date: c.date,
                    close: c.close,
                    high: c.high,
                    low: c.low,
                })),
            }
            console.log(`✅ D+1: ${stats.d0d1Return?.toFixed(2) || 'N/A'}% | D+3: ${stats.d0d3Return?.toFixed(2) || 'N/A'}% | Range: ${stats.range?.toFixed(2)}%`)
            successCount++
        } else {
            console.log(`⚠️ Calc failed`)
            failCount++
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 250))
    }

    // Write output
    const output = {
        generatedAt: new Date().toISOString(),
        count: Object.keys(results).length,
        data: results,
    }

    // Ensure directory exists
    if (!fs.existsSync('src/data')) {
        fs.mkdirSync('src/data', { recursive: true })
    }

    fs.writeFileSync('src/data/macro-reactions.json', JSON.stringify(output, null, 2))
    console.log(`\n✅ Success: ${successCount} | Failed: ${failCount}`)
    console.log(`📁 Saved to src/data/macro-reactions.json`)
}

main().catch(console.error)
