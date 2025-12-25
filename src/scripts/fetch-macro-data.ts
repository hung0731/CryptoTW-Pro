import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { MACRO_OCCURRENCES, MacroReaction } from '../lib/macro-events';

// Configuration
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/macro-reactions.json');
const DAYS_BEFORE = 3;
const DAYS_AFTER = 5;
const SYMBOL = 'BTC';
const API_KEY = process.env.COINGLASS_API_KEY;

// API Config
const V4_URL = 'https://open-api-v4.coinglass.com';
const V3_URL = 'https://open-api-v3.coinglass.com';

/* Helper: Delay */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/* Helper: Fetch from API */
async function fetchFromApi(name: string, url: string) {
    if (!API_KEY) {
        console.error("Missing COINGLASS_API_KEY");
        return null;
    }
    const headers = {
        'accept': 'application/json',
        'CG-API-KEY': API_KEY,
        'content-type': 'application/json'
    };

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
            console.error(`❌ ${name} Failed: ${res.status}`);
            return null;
        }
        const json = await res.json();
        if (json.code !== '0') {
            console.error(`❌ ${name} API Error: ${json.msg}`);
            return null;
        }
        return json.data;
    } catch (e) {
        console.error(`❌ ${name} Error:`, e);
        return null;
    }
}

// Main Function
async function main() {
    console.log(`Starting Macro Data Backfill for ${SYMBOL}...`);

    // Filter for past events only
    const now = new Date();
    const pastEvents = MACRO_OCCURRENCES.filter(e => new Date(e.occursAt) <= now);
    console.log(`Found ${pastEvents.length} past events to process.`);

    let existingData: any = {};

    // Load existing
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')).data || {};
            console.log(`Loaded ${Object.keys(existingData).length} existing records.`);
        } catch (e) { }
    }

    const results: Record<string, any> = { ...existingData };
    let processedCount = 0;

    for (const event of pastEvents) {
        const dateStr = new Date(event.occursAt).toISOString().split('T')[0];
        const key = `${event.eventKey}-${dateStr}`;

        // Check if rich data exists
        if (results[key] && results[key].priceData && results[key].priceData.length > 0) {
            const sample = results[key].priceData[0];
            if (sample.oi !== undefined && sample.fundingRate !== undefined) {
                console.log(`[SKIP] ${key} has rich data.`);
                continue;
            }
        }

        console.log(`[PROCESS] Fetching data for ${key}...`);

        try {
            const occursAt = new Date(event.occursAt);
            const start = new Date(occursAt);
            start.setDate(start.getDate() - DAYS_BEFORE);
            const end = new Date(occursAt);
            end.setDate(end.getDate() + DAYS_AFTER);

            const startTs = start.getTime(); // ms
            const endTs = end.getTime(); // ms

            // 1. Fetch Price (V4)
            const priceUrl = new URL(`${V4_URL}/api/futures/price/history`);
            priceUrl.searchParams.append('exchange', 'Binance');
            priceUrl.searchParams.append('symbol', `${SYMBOL}USDT`);
            priceUrl.searchParams.append('interval', '1d');
            priceUrl.searchParams.append('start_time', String(startTs));
            priceUrl.searchParams.append('end_time', String(endTs));

            const prices = await fetchFromApi('Price', priceUrl.toString());
            await delay(300);

            // 2. Fetch Funding (V4)
            const fundingUrl = new URL(`${V4_URL}/api/futures/funding-rate/history`);
            fundingUrl.searchParams.append('exchange', 'Binance');
            fundingUrl.searchParams.append('symbol', `${SYMBOL}USDT`);
            fundingUrl.searchParams.append('interval', '1d');
            fundingUrl.searchParams.append('start_time', String(startTs));
            fundingUrl.searchParams.append('end_time', String(endTs));

            const fundings = await fetchFromApi('Funding', fundingUrl.toString());
            await delay(300);

            // 3. Fetch OI (V3) - Expects seconds
            const oiUrl = new URL(`${V3_URL}/api/futures/openInterest/ohlc-aggregated-history`);
            oiUrl.searchParams.append('symbol', SYMBOL);
            oiUrl.searchParams.append('interval', '1d');
            oiUrl.searchParams.append('startTime', String(Math.floor(startTs / 1000)));
            oiUrl.searchParams.append('endTime', String(Math.floor(endTs / 1000)));

            const ois = await fetchFromApi('OI', oiUrl.toString());
            await delay(300);

            if (!prices || !Array.isArray(prices) || prices.length === 0) {
                console.warn(`  ! No price data for ${key}`);
                continue;
            }

            // 4. Merge
            const mergedData = prices.map((p: any) => {
                const pDate = new Date(p.time).toISOString().split('T')[0];

                // Find matching OI
                const oiMatch = Array.isArray(ois) ? ois.find((o: any) => new Date(o.t * 1000).toISOString().split('T')[0] === pDate) : null;

                // Find matching Funding
                const fMatch = Array.isArray(fundings) ? fundings.find((f: any) => new Date(f.time).toISOString().split('T')[0] === pDate) : null;

                return {
                    date: pDate,
                    close: parseFloat(p.close),
                    high: parseFloat(p.high),
                    low: parseFloat(p.low),
                    oi: oiMatch ? parseFloat(oiMatch.c) : undefined,
                    fundingRate: fMatch ? parseFloat(fMatch.close) * 100 : undefined // Store as Percentage (e.g. 0.01)
                };
            });

            // 5. Calculate Basic Stats (D0-D1 Return)
            const d0Index = mergedData.findIndex((d: any) => d.date === dateStr);
            let d1Return = 0;
            if (d0Index !== -1 && d0Index + 1 < mergedData.length) {
                const d0 = mergedData[d0Index].close;
                const d1 = mergedData[d0Index + 1].close;
                d1Return = Number(((d1 - d0) / d0 * 100).toFixed(2));
            }
            // Simple range calculation
            const range = d0Index !== -1 ? Number(((mergedData[d0Index].high - mergedData[d0Index].low) / mergedData[d0Index].close * 100).toFixed(2)) : 0;


            results[key] = {
                eventKey: event.eventKey,
                occursAt: event.occursAt,
                stats: {
                    d0d1Return: d1Return,
                    d0d3Return: 0, // Placeholder
                    maxDrawdown: 0, // Placeholder
                    maxUpside: 0, // Placeholder
                    range: range,
                    direction: d1Return > 0.5 ? 'up' : d1Return < -0.5 ? 'down' : 'chop'
                },
                priceData: mergedData
            };

            processedCount++;
            console.log(`  > Success: ${mergedData.length} records.`);

        } catch (err) {
            console.error(`  x Failed processing ${key}: ${err}`);
        }
    }

    const output = {
        generatedAt: new Date().toISOString(),
        count: Object.keys(results).length,
        data: results
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Done! Saved ${processedCount} new records to ${OUTPUT_FILE}`);
}

main();
