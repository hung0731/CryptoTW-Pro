/**
 * Fetch Macro Event History Script
 * 
 * This script fetches BTC price data around macro event dates (D-5 to D+5)
 * and outputs normalized returns for the Economic Calendar V2.
 * 
 * Usage: node scripts/fetch-macro-history.js
 */

const fs = require('fs')
const path = require('path')

// ====== Configuration ======
const BINANCE_BASE = 'https://api.binance.com/api/v3'
const OUTPUT_PATH = path.join(__dirname, '../src/data/macro-history.json')

// Event dates (same as in macro-events.ts)
const MACRO_EVENT_DATES = {
    cpi: [
        '2024-11-13',
        '2024-10-10',
        '2024-09-11',
        '2024-08-14',
        '2024-07-11',
        '2024-06-12',
        '2024-05-15',
        '2024-04-10',
        '2024-03-12',
        '2024-02-13',
        '2024-01-11',
    ],
    nfp: [
        '2024-12-06',
        '2024-11-01',
        '2024-10-04',
        '2024-09-06',
        '2024-08-02',
        '2024-07-05',
        '2024-06-07',
        '2024-05-03',
        '2024-04-05',
        '2024-03-08',
    ],
    fomc: [
        '2024-11-07',
        '2024-09-18',
        '2024-07-31',
        '2024-06-12',
        '2024-05-01',
        '2024-03-20',
        '2024-01-31',
        '2023-12-13',
    ]
}

// Event metadata
const MACRO_EVENT_TYPES = {
    cpi: {
        key: 'cpi',
        name: '消費者物價指數',
        nameEn: 'CPI',
        description: '美國勞工統計局每月公布的消費者物價變動指數，是衡量通貨膨脹的核心指標。',
        narrative: '通膨敘事核心',
        frequency: '每月中旬',
        icon: '📊'
    },
    nfp: {
        key: 'nfp',
        name: '非農就業',
        nameEn: 'Non-Farm Payrolls',
        description: '美國每月公布的非農業部門新增就業人數，反映勞動市場健康程度。',
        narrative: '風險資產短線波動王',
        frequency: '每月第 1 週五',
        icon: '💼'
    },
    fomc: {
        key: 'fomc',
        name: '聯準會利率決議',
        nameEn: 'FOMC Rate Decision',
        description: 'Fed 聯邦公開市場委員會的利率決策及聲明，決定貨幣政策走向。',
        narrative: '趨勢切換來源',
        frequency: '每 6-8 週',
        icon: '🏛️'
    }
}

// Historical values (for display)
const MACRO_EVENT_VALUES = {
    cpi: [
        { date: '2024-11-13', actualValue: '2.6%', forecastValue: '2.6%', previousValue: '2.4%', result: 'inline' },
        { date: '2024-10-10', actualValue: '2.4%', forecastValue: '2.3%', previousValue: '2.5%', result: 'miss' },
        { date: '2024-09-11', actualValue: '2.5%', forecastValue: '2.5%', previousValue: '2.9%', result: 'inline' },
        { date: '2024-08-14', actualValue: '2.9%', forecastValue: '3.0%', previousValue: '3.0%', result: 'beat' },
        { date: '2024-07-11', actualValue: '3.0%', forecastValue: '3.1%', previousValue: '3.3%', result: 'beat' },
        { date: '2024-06-12', actualValue: '3.3%', forecastValue: '3.4%', previousValue: '3.4%', result: 'beat' },
        { date: '2024-05-15', actualValue: '3.4%', forecastValue: '3.4%', previousValue: '3.5%', result: 'inline' },
        { date: '2024-04-10', actualValue: '3.5%', forecastValue: '3.4%', previousValue: '3.2%', result: 'miss' },
        { date: '2024-03-12', actualValue: '3.2%', forecastValue: '3.1%', previousValue: '3.1%', result: 'miss' },
        { date: '2024-02-13', actualValue: '3.1%', forecastValue: '2.9%', previousValue: '3.4%', result: 'miss' },
        { date: '2024-01-11', actualValue: '3.4%', forecastValue: '3.2%', previousValue: '3.1%', result: 'miss' },
    ],
    nfp: [
        { date: '2024-12-06', actualValue: '227K', forecastValue: '220K', previousValue: '36K', result: 'beat' },
        { date: '2024-11-01', actualValue: '12K', forecastValue: '106K', previousValue: '223K', result: 'miss' },
        { date: '2024-10-04', actualValue: '254K', forecastValue: '147K', previousValue: '159K', result: 'beat' },
        { date: '2024-09-06', actualValue: '142K', forecastValue: '164K', previousValue: '89K', result: 'miss' },
        { date: '2024-08-02', actualValue: '114K', forecastValue: '176K', previousValue: '179K', result: 'miss' },
        { date: '2024-07-05', actualValue: '206K', forecastValue: '190K', previousValue: '218K', result: 'beat' },
        { date: '2024-06-07', actualValue: '272K', forecastValue: '182K', previousValue: '165K', result: 'beat' },
        { date: '2024-05-03', actualValue: '175K', forecastValue: '243K', previousValue: '315K', result: 'miss' },
        { date: '2024-04-05', actualValue: '303K', forecastValue: '214K', previousValue: '270K', result: 'beat' },
        { date: '2024-03-08', actualValue: '275K', forecastValue: '198K', previousValue: '229K', result: 'beat' },
    ],
    fomc: [
        { date: '2024-11-07', actualValue: '4.50-4.75%', forecastValue: '4.50-4.75%', previousValue: '4.75-5.00%', result: 'inline' },
        { date: '2024-09-18', actualValue: '4.75-5.00%', forecastValue: '4.75-5.00%', previousValue: '5.25-5.50%', result: 'inline' },
        { date: '2024-07-31', actualValue: '5.25-5.50%', forecastValue: '5.25-5.50%', previousValue: '5.25-5.50%', result: 'inline' },
        { date: '2024-06-12', actualValue: '5.25-5.50%', forecastValue: '5.25-5.50%', previousValue: '5.25-5.50%', result: 'inline' },
        { date: '2024-05-01', actualValue: '5.25-5.50%', forecastValue: '5.25-5.50%', previousValue: '5.25-5.50%', result: 'inline' },
        { date: '2024-03-20', actualValue: '5.25-5.50%', forecastValue: '5.25-5.50%', previousValue: '5.25-5.50%', result: 'inline' },
        { date: '2024-01-31', actualValue: '5.25-5.50%', forecastValue: '5.25-5.50%', previousValue: '5.25-5.50%', result: 'inline' },
        { date: '2023-12-13', actualValue: '5.25-5.50%', forecastValue: '5.25-5.50%', previousValue: '5.25-5.50%', result: 'inline' },
    ]
}

// Pre-event notes (hardcoded for now)
const PRE_EVENT_NOTES = {
    cpi: '過去 8 次 CPI 前 24h 常見假突破，建議降低槓桿。',
    nfp: '非農公布後 15 分鐘內波動最劇烈，小心滑點與爆倉。',
    fomc: 'FOMC 聲明後常見「鮑威爾反轉」，需等記者會結束才有明確方向。'
}

// ====== Utility Functions ======
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch BTC daily klines from Binance
 * @param {string} startDate - Format: YYYY-MM-DD
 * @param {string} endDate - Format: YYYY-MM-DD
 */
async function fetchBTCPrices(startDate, endDate) {
    const startTime = new Date(startDate).getTime()
    const endTime = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 // Include end date

    const url = `${BINANCE_BASE}/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=30`

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`Binance API error: ${res.status}`)
    }

    const data = await res.json()

    // Transform to { date, price }
    return data.map(k => ({
        date: new Date(k[0]).toISOString().split('T')[0],
        price: parseFloat(k[4]) // Close price
    }))
}

/**
 * Fetch price data around an event date (D-5 to D+5)
 * @param {string} eventDate - Format: YYYY-MM-DD
 * @returns {Array} Normalized returns [{t, r}]
 */
async function fetchEventPriceData(eventDate) {
    const d0 = new Date(eventDate)
    const startDate = new Date(d0.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = new Date(d0.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const prices = await fetchBTCPrices(startDate, endDate)

    // Find D0 price
    const d0Price = prices.find(p => p.date === eventDate)?.price
    if (!d0Price) {
        console.warn(`⚠️ No D0 price found for ${eventDate}`)
        return []
    }

    // Calculate normalized returns for D-5 to D+5
    const result = []
    for (let t = -5; t <= 5; t++) {
        const targetDate = new Date(d0.getTime() + t * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const priceData = prices.find(p => p.date === targetDate)

        if (priceData) {
            const r = (priceData.price / d0Price) - 1
            result.push({ t, r: Math.round(r * 10000) / 10000 }) // Round to 4 decimals
        }
    }

    return result
}

/**
 * Calculate stats from price data
 * @param {Object} priceData - { date: [{t, r}] }
 * @returns {Object} Stats object
 */
function calculateStats(priceData, preEventNote) {
    const instances = Object.values(priceData)

    // D0 Volatility: Absolute return at D0 (which should be 0 by definition, so use D+1)
    // Actually, D0 is defined as the day of the event, so we measure |r| at D+1 or use intraday data
    // For simplicity, let's use |r| at D+1 as "D0 reaction"
    const d0Volatilities = instances
        .map(pts => pts.find(p => p.t === 1)?.r)
        .filter(r => r !== undefined)
        .map(r => Math.abs(r) * 100) // Convert to %

    const avg = d0Volatilities.length > 0
        ? Math.round(d0Volatilities.reduce((a, b) => a + b, 0) / d0Volatilities.length * 10) / 10
        : 0

    const sorted = [...d0Volatilities].sort((a, b) => a - b)
    const median = sorted.length > 0
        ? Math.round(sorted[Math.floor(sorted.length / 2)] * 10) / 10
        : 0

    const p90Index = Math.floor(sorted.length * 0.9)
    const p90 = sorted.length > 0
        ? Math.round(sorted[p90Index] * 10) / 10
        : 0

    // Direction Win Rate: % of times D+1 and D+3 are positive
    const d1Returns = instances
        .map(pts => pts.find(p => p.t === 1)?.r)
        .filter(r => r !== undefined)

    const d3Returns = instances
        .map(pts => pts.find(p => p.t === 3)?.r)
        .filter(r => r !== undefined)

    const d1Up = d1Returns.length > 0
        ? Math.round(d1Returns.filter(r => r > 0).length / d1Returns.length * 100)
        : 50

    const d3Up = d3Returns.length > 0
        ? Math.round(d3Returns.filter(r => r > 0).length / d3Returns.length * 100)
        : 50

    return {
        d0Volatility: { avg, median, p90 },
        directionWinRate: { d1Up, d3Up },
        preEventNote
    }
}

// ====== Main Execution ======
async function main() {
    console.log('🚀 Fetching macro event history...\n')

    const output = {}

    for (const [eventKey, dates] of Object.entries(MACRO_EVENT_DATES)) {
        console.log(`📊 Processing ${eventKey.toUpperCase()}...`)

        const priceData = {}
        const instances = MACRO_EVENT_VALUES[eventKey] || []

        for (const date of dates) {
            try {
                console.log(`   Fetching ${date}...`)
                const returns = await fetchEventPriceData(date)
                if (returns.length > 0) {
                    priceData[date] = returns
                }
                await sleep(200) // Rate limiting
            } catch (err) {
                console.error(`   ❌ Failed to fetch ${date}: ${err.message}`)
            }
        }

        // Calculate stats
        const stats = calculateStats(priceData, PRE_EVENT_NOTES[eventKey])

        output[eventKey] = {
            type: MACRO_EVENT_TYPES[eventKey],
            instances: instances.map(i => ({ typeKey: eventKey, ...i })),
            priceData,
            stats
        }

        console.log(`   ✅ ${Object.keys(priceData).length} instances processed`)
        console.log(`   📈 Stats: D0 Avg ${stats.d0Volatility.avg}%, D+1 Up ${stats.directionWinRate.d1Up}%\n`)
    }

    // Write output
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
    console.log(`\n✅ Output written to ${OUTPUT_PATH}`)
}

main().catch(console.error)
