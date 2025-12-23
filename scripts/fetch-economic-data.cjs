#!/usr/bin/env node

/**
 * Fetch Economic Calendar Data from Coinglass
 * 
 * This script fetches CPI, NFP, and FOMC forecast/actual values
 * from Coinglass Economic Data API and updates macro-events.ts
 * 
 * Usage: COINGLASS_API_KEY=xxx node scripts/fetch-economic-data.js
 */

require('dotenv').config()
require('dotenv').config({ path: '.env.local' })

const fs = require('fs')

const API_KEY = process.env.COINGLASS_API_KEY
const API_URL = 'https://open-api-v4.coinglass.com/api/calendar/economic-data'

// Keywords to identify events
const EVENT_KEYWORDS = {
    cpi: ['CPI', 'Consumer Price Index', '消費者物價'],
    nfp: ['NFP', 'Non-Farm Payroll', 'Nonfarm', 'Employment Situation', '非農'],
    fomc: ['FOMC', 'Federal Reserve', 'Fed Rate', 'Interest Rate Decision', '聯準會', '利率決議']
}

// Only US events
const TARGET_COUNTRY = 'USA'

async function fetchEconomicData(startTime, endTime) {
    const url = `${API_URL}?start_time=${startTime}&end_time=${endTime}&language=en`

    try {
        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': API_KEY,
                'Accept': 'application/json'
            }
        })

        if (!res.ok) {
            console.error(`HTTP ${res.status}: ${await res.text()}`)
            return []
        }

        const json = await res.json()

        if (json.code !== '0') {
            console.error(`API Error: ${json.msg || json.code}`)
            return []
        }

        return json.data || []
    } catch (err) {
        console.error(`Fetch error: ${err.message}`)
        return []
    }
}

function identifyEventType(calendarName) {
    const lowerName = calendarName.toLowerCase()

    for (const [type, keywords] of Object.entries(EVENT_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerName.includes(keyword.toLowerCase())) {
                return type
            }
        }
    }
    return null
}

function parseValue(valueStr) {
    if (!valueStr || valueStr === '' || valueStr === '-') return undefined
    // Remove % and parse
    const cleaned = valueStr.replace('%', '').replace('K', '').trim()
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
}

async function main() {
    if (!API_KEY) {
        console.error('❌ COINGLASS_API_KEY not set. Run with: COINGLASS_API_KEY=xxx node scripts/fetch-economic-data.js')
        process.exit(1)
    }

    console.log('🚀 Fetching economic data from Coinglass...\n')

    // Query range: current time +/- 15 days (API limit)
    const now = Date.now()
    const startTime = now - 15 * 24 * 60 * 60 * 1000
    const endTime = now + 15 * 24 * 60 * 60 * 1000

    console.log(`📅 Query range: ${new Date(startTime).toISOString().split('T')[0]} to ${new Date(endTime).toISOString().split('T')[0]}`)

    const data = await fetchEconomicData(startTime, endTime)

    if (data.length === 0) {
        console.log('⚠️ No data returned from API')
        return
    }

    console.log(`\n📊 Retrieved ${data.length} economic events total\n`)

    // Debug: Show US high-importance events
    console.log('🔍 US High-Importance Events (importance >= 2):')
    const usEvents = data.filter(item => item.country_code === TARGET_COUNTRY && item.importance_level >= 2)
    for (const item of usEvents.slice(0, 30)) {
        console.log(`  [${item.importance_level}] ${item.calendar_name}`)
    }
    console.log('')

    // Filter for US CPI/NFP/FOMC events
    const relevantEvents = []

    for (const item of data) {
        if (item.country_code !== TARGET_COUNTRY) continue

        const eventType = identifyEventType(item.calendar_name)
        if (!eventType) continue

        const publishDate = new Date(item.publish_timestamp)

        relevantEvents.push({
            type: eventType,
            name: item.calendar_name,
            date: publishDate.toISOString(),
            dateStr: publishDate.toISOString().split('T')[0],
            forecast: item.forecast_value,
            actual: item.published_value,
            previous: item.previous_value,
            importance: item.importance_level,
            forecastNum: parseValue(item.forecast_value),
            actualNum: parseValue(item.published_value)
        })
    }

    // Sort by date
    relevantEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log('='.repeat(80))
    console.log('US CPI / NFP / FOMC Events in Range')
    console.log('='.repeat(80))

    const grouped = { cpi: [], nfp: [], fomc: [] }

    for (const evt of relevantEvents) {
        grouped[evt.type].push(evt)

        const typeLabel = evt.type.toUpperCase().padEnd(4)
        const dateLabel = evt.dateStr
        const forecastLabel = evt.forecast || '-'
        const actualLabel = evt.actual || '-'

        console.log(`${typeLabel} | ${dateLabel} | Forecast: ${forecastLabel.padEnd(10)} | Actual: ${actualLabel.padEnd(10)} | ${evt.name.slice(0, 50)}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log('Summary:')
    console.log(`  CPI:  ${grouped.cpi.length} events`)
    console.log(`  NFP:  ${grouped.nfp.length} events`)
    console.log(`  FOMC: ${grouped.fomc.length} events`)
    console.log('='.repeat(80))

    // Save to file
    const output = {
        generatedAt: new Date().toISOString(),
        queryRange: {
            start: new Date(startTime).toISOString(),
            end: new Date(endTime).toISOString()
        },
        events: relevantEvents
    }

    fs.writeFileSync('src/data/economic-calendar.json', JSON.stringify(output, null, 2))
    console.log('\n📁 Saved to src/data/economic-calendar.json')
}

main().catch(console.error)
