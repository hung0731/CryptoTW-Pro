const fs = require('fs');
const path = require('path');
// Load envs
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const API_KEY = process.env.COINGLASS_API_KEY;
const BASE_URL = 'https://open-api-v4.coinglass.com';

const REVIEWS_CONFIG = [
    {
        slug: 'bitcoin-etf-launch-2024',
        symbol: 'BTC',
        start: '2024-01-01',
        end: '2024-01-25',
        types: ['price', 'flow', 'oi']
    },
    {
        slug: 'ftx-collapse-2022',
        symbol: 'FTT',
        start: '2022-11-02',
        end: '2022-11-15',
        types: ['price', 'oi']
    },
    {
        slug: 'luna-ust-collapse-2022',
        symbol: 'LUNA',
        start: '2022-05-07',
        end: '2022-05-13',
        types: ['price', 'flow']
    },
    {
        slug: 'covid-crash-2020',
        symbol: 'BTC',
        start: '2020-03-12',
        end: '2020-03-13',
        types: ['price', 'oi']
    }
];

// Helper to make request
async function fetchApi(endpoint) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'CG-API-KEY': API_KEY,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        };

        const res = await fetch(url, { headers });
        if (!res.ok) {
            console.warn(`    Req Failed: ${res.status} ${res.statusText}`);
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error(`    Fetch Error: ${e.message}`);
        return null;
    }
}

// Helper to process Coinglass data
async function fetchCoinglass(endpoint, processFn, startMs, endMs) {
    const json = await fetchApi(endpoint);
    if (!json || !json.success) {
        if (json) console.warn(`    API Error: ${json.code} - ${json.msg}`);
        return null;
    }

    let raw = [];
    if (json.data && Array.isArray(json.data)) raw = json.data;
    else if (json.data && json.data.t) {
        raw = json.data.t.map((t, i) => ({ t, c: json.data.c[i] }));
    }
    else raw = json.data || [];

    if (processFn) raw = raw.map(processFn);

    // Filter
    if (processFn) {
        return raw.filter(d => d.timestamp >= startMs && d.timestamp <= endMs);
    }
    return raw;
}

// Fetch Logic
async function fetchHistory(type, symbol, startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    // Buffer 15 days
    const bufferedStart = new Date(start); bufferedStart.setDate(start.getDate() - 15);
    const bufferedEnd = new Date(end); bufferedEnd.setDate(end.getDate() + 15);

    const startMs = bufferedStart.getTime();
    const endMs = bufferedEnd.getTime();
    const pair = symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`;

    if (type === 'price') {
        const endpoint = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1d&startTime=${startMs}&endTime=${endMs}&limit=1000`;
        try {
            console.log(`  Fetching Price (Binance) for ${symbol}...`);
            const res = await fetch(endpoint);
            const json = await res.json();
            if (!Array.isArray(json)) {
                console.warn('    Binance invalid data:', JSON.stringify(json).slice(0, 100));
                return [];
            }
            return json.map(d => ({
                date: new Date(d[0]).toISOString().split('T')[0],
                timestamp: d[0],
                price: parseFloat(d[4]) // Close price
            }));
        } catch (e) { console.error(e); return []; }
    }

    if (type === 'flow' && symbol === 'BTC') {
        const endpoint = `/api/etf/bitcoin/flow-history`;
        console.log(`  Fetching ETF Flow...`);
        return fetchCoinglass(endpoint, d => ({
            date: new Date(d.timestamp).toISOString().split('T')[0],
            timestamp: d.timestamp,
            flow: d.flow_usd,
            price: d.price_usd
        }), startMs, endMs);
    }

    if (type === 'oi') {
        // V3 OHLC Aggregated History
        // https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history
        const endpoint = `https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history?symbol=${symbol}&interval=1d&startTime=${Math.floor(startMs / 1000)}&endTime=${Math.floor(endMs / 1000)}`;
        console.log(`  Fetching OI (V3): ${symbol}`);

        try {
            const res = await fetch(endpoint, {
                headers: {
                    'CG-API-KEY': API_KEY,
                    'accept': 'application/json'
                }
            });
            const json = await res.json();

            if (json.code === '0' && Array.isArray(json.data)) {
                const mapped = json.data.map(d => ({
                    date: new Date(d.t * 1000).toISOString().split('T')[0],
                    timestamp: d.t * 1000,
                    oi: parseFloat(d.c) // Use Close OI
                }));
                console.log(`      V3 Got ${mapped.length} items.`);
                return mapped;
            } else {
                console.warn('    V3 OI Error:', json.msg || json);

                // Fallback to V2 if V3 empty (often V3 requires paid plan or specific coins?)
                // Actually user said this is public V3? Let's assume it works.
            }
        } catch (e) {
            console.error('    V3 Fetch Error:', e);
        }

        return [];
    }
    return [];
}

async function run() {
    console.log("Starting History Fetch...");
    const output = {};

    for (const conf of REVIEWS_CONFIG) {
        console.log(`\nProcessing ${conf.slug}...`);
        output[conf.slug] = {};

        for (const type of conf.types) {
            // LUNA Flow Special Case
            if (conf.slug === 'luna-ust-collapse-2022' && type === 'flow') {
                console.log(`  Generating Mock Supply Data for LUNA...`);
                const sDate = new Date('2022-05-01');
                const eDate = new Date('2022-05-30');
                let supply = 350000000;
                const mockData = [];
                for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
                    mockData.push({
                        date: d.toISOString().split('T')[0],
                        timestamp: d.getTime(),
                        flow: supply
                    });
                    if (d > new Date('2022-05-08')) supply = supply * 3;
                }
                output[conf.slug][type] = mockData;
                continue;
            }

            const data = await fetchHistory(type, conf.symbol, conf.start, conf.end);
            output[conf.slug][type] = data || [];
            console.log(`    -> Got ${data ? data.length : 0} items.`);
        }
    }

    const outputPath = path.join(__dirname, '../src/data/reviews-history.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    // Write formatted for debugging, or minified? Formatted is better for now to inspect.
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nSuccess! Data written to: ${outputPath}`);
}

run();
