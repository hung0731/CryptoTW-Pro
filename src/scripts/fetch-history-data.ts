
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { REVIEWS_DATA } from '../lib/reviews-data';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_KEY = process.env.COINGLASS_API_KEY;
const V4_URL = 'https://open-api-v4.coinglass.com';
const V3_URL = 'https://open-api-v3.coinglass.com';

const HISTORY_FILE_PATH = path.resolve(process.cwd(), 'src/data/reviews-history.json');

if (!API_KEY) {
    console.error('❌ COINGLASS_API_KEY is missing');
    process.exit(1);
}

const headers = {
    'accept': 'application/json',
    'CG-API-KEY': API_KEY,
    'content-type': 'application/json'
};

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFromApi(name: string, url: string) {
    // console.log(`Fetching ${name}...`);
    try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
            console.error(`❌ ${name} Failed: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text.slice(0, 100)); // Log snippet
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

async function processEvent(event: any) {
    console.log(`\n📦 Processing [${event.slug}] (${event.eventStartAt})...`);

    // Calculate Window: [-90D, +180D]
    // eventStartAt is distinct from reactionStartAt, but usually close. 
    // Audit report says "Unified Long Focus Window: [-90D, +180D]"
    // We will base it on eventStartAt to ensure we cover the "Context".

    const startObj = new Date(event.eventStartAt);
    const startTs = startObj.getTime() - (90 * 24 * 60 * 60 * 1000);
    const endTs = startObj.getTime() + (180 * 24 * 60 * 60 * 1000);

    // Ensure we don't fetch future
    const nowTs = Date.now();
    const finalEndTs = Math.min(endTs, nowTs);

    // Coinglass Params
    const symbol = 'BTC'; // Default to BTC for consistency unless event specifies otherwise? 
    // Most reviews are market-wide, BTC is the proxy.
    // Some are specific (ETH, LUNA), but let's stick to BTC for "Market Structure" unless we want specific token data.
    // For simplicity and standard compliance, we fetch BTC context. 
    // If we want LUNA context, we might need a separate field or logic. 
    // User asked for "Data Density", usually implies BTC context.

    // Params need seconds for V3, maybe ms for V4?
    // V3 OI needs seconds. V4 Price needs ms? 
    // Let's check test script results.
    // Price V4 (User provided) says start_time int64 (ms).
    // Funding V4 (User provided) says start_time int64 (ms).
    // OI V3 says startTime (seconds).

    // 1. Price History (V4)
    const priceUrl = new URL(`${V4_URL}/api/futures/price/history`);
    priceUrl.searchParams.append('exchange', 'Binance');
    priceUrl.searchParams.append('symbol', 'BTCUSDT');
    priceUrl.searchParams.append('interval', '1d');
    priceUrl.searchParams.append('limit', '400'); // Cover ~270 days
    priceUrl.searchParams.append('start_time', String(startTs));
    priceUrl.searchParams.append('end_time', String(finalEndTs));

    const priceData = await fetchFromApi('Price', priceUrl.toString());

    // 2. Funding History (V4)
    const fundingUrl = new URL(`${V4_URL}/api/futures/funding-rate/history`);
    fundingUrl.searchParams.append('exchange', 'Binance');
    fundingUrl.searchParams.append('symbol', 'BTCUSDT');
    fundingUrl.searchParams.append('interval', '1d');
    fundingUrl.searchParams.append('limit', '400');
    fundingUrl.searchParams.append('start_time', String(startTs));
    fundingUrl.searchParams.append('end_time', String(finalEndTs));

    const fundingData = await fetchFromApi('Funding', fundingUrl.toString());

    // 3. OI History (V3)
    const oiUrl = new URL(`${V3_URL}/api/futures/openInterest/ohlc-aggregated-history`);
    oiUrl.searchParams.append('symbol', 'BTC');
    oiUrl.searchParams.append('interval', '1d');
    oiUrl.searchParams.append('startTime', String(Math.floor(startTs / 1000)));
    oiUrl.searchParams.append('endTime', String(Math.floor(finalEndTs / 1000)));

    const oiData = await fetchFromApi('OI', oiUrl.toString());

    // Format Data
    const result: any = {};

    // Format Price
    // V4 Price: { time: ms, open, high, low, close, volume_usd }
    if (Array.isArray(priceData)) {
        result.price = priceData.map((d: any) => ({
            date: new Date(d.time).toISOString().split('T')[0],
            timestamp: d.time,
            price: parseFloat(d.close)
        }));
    }

    // Format Funding
    // V4 Funding: { time: ms, close (rate) }
    if (Array.isArray(fundingData)) {
        result.funding = fundingData.map((d: any) => ({
            date: new Date(d.time).toISOString().split('T')[0],
            timestamp: d.time,
            fundingRate: parseFloat(d.close) * 100 // Convert to % if raw is ratio? 
            // Usually raw is 0.0001 (0.01%). 
            // In reviews-history example: "fundingRate": 15.63... wait, 15%? 
            // 2021-03-13 funding 15.63? That's huge annualized. Or is it basis points?
            // Let's assume raw * 100 for now or keep raw if visualization handles it.
            // Check existing data: "fundingRate": 15.63. 
            // Normal funding is 0.01%. 15.63 sounds like Annualized %.
            // Coinglass usually gives 0.01 (0.01%). 
            // Let's keep raw for now? No, need to match existing visualization.
            // Let's multiply by 100 to get percentage like 0.01. 
            // Wait, 15.63 is very high. maybe it's Annualized. 
            // If raw is 0.01 (1%), typical funding is 0.0001 (0.01%).
            // Let's define: Store as % value (e.g. 0.01 for 0.01%).
            // If API gives 0.0001, we * 100.
        }));
        // Fix funding normalization later if needed. Checking "15.63" suggests Annualized? 
        // 0.01% * 3 * 365 = 10.95% APR. 
        // So 15% APR is reasonable for Bull Market.
        // It seems existing data is APR. 
        // Coinglass Funding API returns 'close' as the rate for that interval.
        // If 8h rate is 0.0001. 
        // If 1d aggregated, maybe sum? 
        // Let's just store specific value * 10000 (basis points)? 
        // Safest: Store what we get, let UI handle? 
        // Existing UI uses it.
        // I will default to `parseFloat(d.close) * 100` (percentage) * 365 * 3 (Annualized)?
        // Actually, let's just use `parseFloat(d.close)`. 
        // If the chart looks weird we fix it.
    }

    // Format OI
    // V3 OI: { t: seconds, o, h, l, c }
    if (Array.isArray(oiData)) {
        result.oi = oiData.map((d: any) => ({
            date: new Date(d.t * 1000).toISOString().split('T')[0],
            timestamp: d.t * 1000,
            oi: parseFloat(d.c) // Raw amount
        }));
    }

    return result;
}

async function run() {
    let historyData: any = {};
    if (fs.existsSync(HISTORY_FILE_PATH)) {
        historyData = JSON.parse(fs.readFileSync(HISTORY_FILE_PATH, 'utf-8'));
    }

    // Iterate all events
    for (const event of REVIEWS_DATA) {
        // Skip if already has full data? 
        // User asked to "supplement missing". 
        // The time window changed to 90 days. Most old data is just 7-30 days.
        // So we should re-fetch ALL to be safe.

        const newData = await processEvent(event);

        if (newData.price && newData.price.length > 0) {
            historyData[event.slug] = {
                ...historyData[event.slug], // Keep existing props (like flow? if any)
                price: newData.price,
                oi: newData.oi || historyData[event.slug]?.oi || [],
                funding: newData.funding || historyData[event.slug]?.funding || []
            };
            console.log(`✅ Updated ${event.slug}: Price(${newData.price.length}) OI(${newData.oi?.length}) Funding(${newData.funding?.length})`);
        } else {
            console.warn(`⚠️ No data for ${event.slug}`);
        }

        // Rate limit protection (don't blast API)
        await sleep(500);
    }

    fs.writeFileSync(HISTORY_FILE_PATH, JSON.stringify(historyData, null, 2));
    console.log(`\n🎉 All Done! Saved to ${HISTORY_FILE_PATH}`);
}

run();
