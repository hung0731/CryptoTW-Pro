import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { MACRO_OCCURRENCES } from '../lib/macro-events';

// Configuration
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/macro-reactions.json');
const DAYS_BEFORE = 3;
const DAYS_AFTER = 8;
const SYMBOL = 'BTCUSDT';
const BASE_URL = 'https://fapi.binance.com';

// Types
interface BinanceKline {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface BinanceOI {
    symbol: string;
    sumOpenInterest: string; // "74495.75300000" (contracts)
    sumOpenInterestValue: string; // "2816986567.89..." (USDT)
    timestamp: number;
}

interface BinanceFunding {
    symbol: string;
    fundingTime: number;
    fundingRate: string;
}

/* Helper: Delay */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/* Helper: Fetch from Binance */
async function fetchBinance<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`❌ Binance Fetch Failed: ${res.status} ${res.statusText} [${url}]`);
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error(`❌ Binance Fetch Error:`, e);
        return null;
    }
}

// 1. Fetch Price (OHLC)
async function fetchPrice(startTs: number, endTs: number): Promise<BinanceKline[]> {
    const url = `${BASE_URL}/fapi/v1/klines?symbol=${SYMBOL}&interval=1d&startTime=${startTs}&endTime=${endTs}`;
    const data = await fetchBinance<any[]>(url);
    if (!data) return [];

    return data.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4])
    }));
}

// 2. Fetch OI History
// openInterestHist is PERIOD based (snapshot), not continuous range. 
// "Get Open Interest Statistics" (openInterestHist) -> Returns list of data. 
// period "1d" means 1 snapshot per day (usually at close).
async function fetchOI(startTs: number, endTs: number): Promise<BinanceOI[]> {
    // Limit is default 30, max 500. range D-3 to D+8 is ~12 days.
    const url = `${BASE_URL}/futures/data/openInterestHist?symbol=${SYMBOL}&period=1d&limit=50&startTime=${startTs}&endTime=${endTs}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            // Suppress 400/404 for OI (historical data limitation)
            if (res.status === 400 || res.status === 404) return [];
            console.error(`❌ Binance Fetch Failed: ${res.status} ${res.statusText} [${url}]`);
            return [];
        }
        return await res.json();
    } catch (e) {
        return [];
    }
}

// 3. Fetch Funding Rate
// fundingRate endpoint returns last 1000 records if no time specified, or time range.
// It returns 8h rates.
async function fetchFunding(startTs: number, endTs: number): Promise<BinanceFunding[]> {
    const url = `${BASE_URL}/fapi/v1/fundingRate?symbol=${SYMBOL}&startTime=${startTs}&endTime=${endTs}&limit=100`;
    const data = await fetchBinance<BinanceFunding[]>(url);
    return data || [];
}

// Main Function
async function main() {
    console.log(`Starting Macro Data Backfill using Binance Futures for ${SYMBOL}...`);

    // Filter for past events only
    const now = new Date();
    const pastEvents = MACRO_OCCURRENCES.filter(e => new Date(e.occursAt) <= now);
    console.log(`Found ${pastEvents.length} past events to process.`);

    let existingData: any = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')).data || {};
            console.log(`Loaded ${Object.keys(existingData).length} existing records.`);
        } catch (e) { }
    }

    const results: Record<string, any> = { ...existingData };
    let processedCount = 0;

    for (const event of pastEvents) {
        const occursAtDate = new Date(event.occursAt);
        const now = new Date(); // Uses system time (2025-12-26)

        // Strict Future Check
        if (occursAtDate > now) {
            // console.log(`[SKIP] Future event ${event.eventKey} (${event.occursAt})`);
            continue;
        }

        const dateStr = occursAtDate.toISOString().split('T')[0];
        const key = `${event.eventKey}-${dateStr}`;

        console.log(`[PROCESS] ${key} (${event.occursAt})...`);

        // Time Window: T-3 to T+8
        const start = new Date(occursAtDate);
        start.setDate(start.getDate() - DAYS_BEFORE);
        const end = new Date(occursAtDate);
        end.setDate(end.getDate() + DAYS_AFTER);

        // Clamp end time to NOW
        const nowTs = now.getTime();
        const startTs = start.getTime();
        const endTs = Math.min(end.getTime(), nowTs);

        try {
            // Parallel Fetch
            const [prices, ois, fundings] = await Promise.all([
                fetchPrice(startTs, endTs),
                fetchOI(startTs, endTs),
                fetchFunding(startTs, endTs)
            ]);

            if (prices.length === 0) {
                console.warn(`  ! No price data for ${key}`);
                continue;
            }

            // Merge Data
            const mergedData = prices.map(price => {
                const date = new Date(price.time).toISOString().split('T')[0];

                // Find OI (Snapshot for that day)
                const oiMatch = ois.find(o => new Date(o.timestamp).toISOString().split('T')[0] === date);

                // Find Funding (Sum of day's rates)
                const dayFundings = fundings.filter(f => new Date(f.fundingTime).toISOString().split('T')[0] === date);

                let fundingRate: number | undefined;
                if (dayFundings.length > 0) {
                    fundingRate = dayFundings.reduce((sum, item) => sum + parseFloat(item.fundingRate), 0);
                    // Convert to Percentage
                    fundingRate = fundingRate * 100;
                }

                return {
                    date,
                    close: price.close,
                    high: price.high,
                    low: price.low,
                    oi: oiMatch ? parseFloat(oiMatch.sumOpenInterestValue) : undefined, // Value in USDT
                    fundingRate
                };
            });

            // Filter for T-2 to T+7 specifically if needed, or keeping buffer is fine.
            // Client side filters/charts based on T number.

            // Calculate Stats
            const d0Index = mergedData.findIndex(d => d.date === dateStr);
            let d1Return = 0;
            let range = 0;

            let maxDrawdown = 0;
            let maxUpside = 0;

            if (d0Index !== -1) {
                // Range
                const d0 = mergedData[d0Index];
                range = Number(((d0.high - d0.low) / d0.close * 100).toFixed(2));

                // D+1 Return
                if (d0Index + 1 < mergedData.length) {
                    const d1 = mergedData[d0Index + 1];
                    d1Return = Number(((d1.close - d0.close) / d0.close * 100).toFixed(2));
                }

                // Analyze T0 to T+7 Window
                const analysisWindow = mergedData.slice(d0Index, d0Index + 8); // T0 to T+7 (8 days)
                let lowestLow = d0.low;
                let highestHigh = d0.high;

                analysisWindow.forEach(day => {
                    if (day.low < lowestLow) lowestLow = day.low;
                    if (day.high > highestHigh) highestHigh = day.high;
                });

                // Calculate % change from T0 Close
                // Drawdown is usually negative
                maxDrawdown = Number(((lowestLow - d0.close) / d0.close * 100).toFixed(2));
                maxUpside = Number(((highestHigh - d0.close) / d0.close * 100).toFixed(2));
            }

            results[key] = {
                eventKey: event.eventKey,
                occursAt: event.occursAt,
                stats: {
                    d0d1Return: d1Return,
                    d0d3Return: 0,
                    maxDrawdown: maxDrawdown,
                    maxUpside: maxUpside,
                    range: range,
                    direction: d1Return > 0.5 ? 'up' : d1Return < -0.5 ? 'down' : 'chop'
                },
                priceData: mergedData
            };

            processedCount++;
            console.log(`  > Success: ${mergedData.length} days data.`);

            // Rate limit buffer (Binance is generous but let's be safe)
            await delay(100);

        } catch (err) {
            console.error(`  x Failed ${key}:`, err);
        }
    }

    const output = {
        generatedAt: new Date().toISOString(),
        count: Object.keys(results).length,
        data: results
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`\nDone! Saved ${processedCount} records to ${OUTPUT_FILE}`);
}

main();
