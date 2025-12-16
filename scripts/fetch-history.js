const fs = require('fs');
const path = require('path');

// Manual .env loading (no dotenv dependency)
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
    });
}
loadEnv(path.join(__dirname, '../.env.local'));
loadEnv(path.join(__dirname, '../.env'));

const API_KEY = process.env.COINGLASS_API_KEY;
const BASE_URL = 'https://open-api-v4.coinglass.com';

// Configuration for all review events
// Uses reactionStartAt as the center point (D0)
const REVIEWS_CONFIG = [
    // S-Class Events
    {
        slug: 'bitcoin-etf-launch-2024',
        symbol: 'BTC',
        reactionStart: '2024-01-10', // D0: SEC approval day
        types: ['price', 'flow', 'oi']
    },
    {
        slug: 'ftx-collapse-2022',
        symbol: 'FTT',
        reactionStart: '2022-11-08', // D0: Binance CZ tweet triggers crash
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'luna-ust-collapse-2022',
        symbol: 'LUNA',
        reactionStart: '2022-05-09', // D0: UST breaks 0.95
        types: ['price', 'flow', 'fgi']
    },
    {
        slug: 'covid-crash-2020',
        symbol: 'BTC',
        reactionStart: '2020-03-09', // D0: Pre-crash selloff begins
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'mtgox-collapse-2014',
        symbol: 'BTC',
        reactionStart: '2014-02-07', // D0: Withdrawal halt
        types: ['price']
    },
    {
        slug: 'the-dao-hack-2016',
        symbol: 'ETH',
        reactionStart: '2016-06-17', // D0: Hack announcement
        types: ['price']
    },
    // A-Class Events
    {
        slug: 'ico-mania-2017',
        symbol: 'ETH',
        reactionStart: '2017-12-17', // D0: BTC peak day
        types: ['price', 'oi']
    },
    {
        slug: 'china-crypto-ban-2021',
        symbol: 'BTC',
        reactionStart: '2021-05-19', // D0: Initial price drop
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'ethereum-merge-2022',
        symbol: 'ETH',
        reactionStart: '2022-09-15', // D0: Merge day
        types: ['price', 'oi']
    },
    // Bitcoin Halvings
    {
        slug: 'bitcoin-halving-2012',
        symbol: 'BTC',
        reactionStart: '2012-11-28', // D0: Block 210,000
        types: ['price']  // 2012 只有價格數據 (from CSV)
    },
    {
        slug: 'bitcoin-halving-2016',
        symbol: 'BTC',
        reactionStart: '2016-07-09', // D0: Block 420,000
        types: ['price']  // 2016 Binance 尚未上線，無法取得 OI
    },
    {
        slug: 'bitcoin-halving-2020',
        symbol: 'BTC',
        reactionStart: '2020-05-11', // D0: Block 630,000
        types: ['price', 'oi']  // 2020 有衍生品數據
    },
    {
        slug: 'bitcoin-halving-2024',
        symbol: 'BTC',
        reactionStart: '2024-04-20', // D0: Block 840,000
        types: ['price', 'flow', 'oi']  // 2024 有完整 ETF 數據
    },
    // ===== New Events =====
    // 2020
    {
        slug: 'defi-summer-2020',
        symbol: 'ETH',
        reactionStart: '2020-06-15', // D0: COMP token launch
        types: ['price', 'oi']
    },
    // 2021
    {
        slug: 'tesla-bitcoin-purchase-2021',
        symbol: 'BTC',
        reactionStart: '2021-02-08', // D0: Tesla 8-K filing
        types: ['price', 'oi']
    },
    {
        slug: 'coinbase-direct-listing-2021',
        symbol: 'BTC',
        reactionStart: '2021-04-14', // D0: Direct listing day
        types: ['price', 'oi']
    },
    {
        slug: 'el-salvador-bitcoin-legal-tender-2021',
        symbol: 'BTC',
        reactionStart: '2021-09-07', // D0: Law takes effect
        types: ['price', 'oi']
    },
    // 2022
    {
        slug: 'celsius-bankruptcy-2022',
        symbol: 'BTC',
        reactionStart: '2022-06-12', // D0: Withdrawals paused
        types: ['price', 'oi', 'fgi']
    },
    {
        slug: 'three-arrows-capital-collapse-2022',
        symbol: 'BTC',
        reactionStart: '2022-06-15', // D0: Rumors of insolvency
        types: ['price', 'oi', 'fgi']
    },
    // 2023
    {
        slug: 'sec-coinbase-lawsuit-2023',
        symbol: 'BTC',
        reactionStart: '2023-06-06', // D0: SEC files lawsuit
        types: ['price', 'oi']
    },
    {
        slug: 'ripple-sec-ruling-2023',
        symbol: 'BTC',
        reactionStart: '2023-07-13', // D0: Judge Torres ruling
        types: ['price', 'oi']
    },
    {
        slug: 'binance-cz-settlement-2023',
        symbol: 'BTC',
        reactionStart: '2023-11-21', // D0: DOJ settlement
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

// Read historical price data from CSV file (for pre-2017 events like Mt.Gox, DAO Hack)
function fetchFromCSV(startMs, endMs) {
    const csvPath = path.join(__dirname, '../INDEX_BTCUSD, 1D (1).csv');
    if (!fs.existsSync(csvPath)) {
        console.warn('    CSV file not found:', csvPath);
        return [];
    }

    console.log('  Reading from CSV file...');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header

    const data = [];
    for (const line of lines) {
        if (!line.trim()) continue;
        const [time, open, high, low, close] = line.split(',');
        const timestamp = parseInt(time) * 1000; // Convert to ms

        if (timestamp >= startMs && timestamp <= endMs) {
            data.push({
                date: new Date(timestamp).toISOString().split('T')[0],
                timestamp,
                price: parseFloat(close)
            });
        }
    }

    console.log(`    -> CSV Got ${data.length} items.`);
    return data;
}

// Fetch Logic - uses reactionStart as center (D0), with T-30 to T+30 window
async function fetchHistory(type, symbol, reactionStartStr) {
    const reactionStart = new Date(reactionStartStr);

    // Buffer 30 days before and after D0 (Total: 61 days)
    const bufferedStart = new Date(reactionStart); bufferedStart.setDate(reactionStart.getDate() - 30);
    const bufferedEnd = new Date(reactionStart); bufferedEnd.setDate(reactionStart.getDate() + 30);

    const startMs = bufferedStart.getTime();
    const endMs = bufferedEnd.getTime();
    const pair = symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`;

    if (type === 'price') {
        // Use CSV for pre-2017 data (Binance doesn't have it)
        const year = reactionStart.getFullYear();
        if (year < 2017) {
            console.log(`  Fetching Price from CSV for ${symbol} (pre-2017 data)...`);
            return fetchFromCSV(startMs, endMs);
        }

        // Use Binance for 2017+ data
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
        // V4 ETF Flow History API
        // Docs: https://docs.coinglass.com/v4.0-zhtw/reference/etf-flows-history
        const endpoint = `https://open-api-v4.coinglass.com/api/etf/bitcoin/flow-history`;
        console.log(`  Fetching ETF Flow (V4)...`);

        try {
            const res = await fetch(endpoint, {
                headers: {
                    'CG-API-KEY': API_KEY,
                    'accept': 'application/json'
                }
            });
            const json = await res.json();

            if (json.code === '0' && Array.isArray(json.data)) {
                // Response format: { timestamp, flow_usd, price_usd, etf_flows }
                const mapped = json.data.map(d => ({
                    date: new Date(d.timestamp).toISOString().split('T')[0],
                    timestamp: d.timestamp,
                    flow: d.flow_usd || 0,
                    price: d.price_usd || 0
                })).filter(d => d.timestamp >= startMs && d.timestamp <= endMs);
                console.log(`      V4 ETF Flow Got ${mapped.length} items.`);
                return mapped;
            } else {
                console.warn('    V4 ETF Flow Error:', json.msg || json.code);
            }
        } catch (e) {
            console.error('    V4 ETF Fetch Error:', e.message);
        }
        return [];
    }

    if (type === 'oi') {
        // V3 OHLC Aggregated History (V4 returns 404)
        // https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history
        const startSec = Math.floor(startMs / 1000);
        const endSec = Math.floor(endMs / 1000);
        const endpoint = `https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history?symbol=${symbol}&interval=1d&startTime=${startSec}&endTime=${endSec}`;
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
            }
        } catch (e) {
            console.error('    V3 OI Fetch Error:', e);
        }

        return [];
    }

    // Fear & Greed Index (V3 API)
    if (type === 'fgi') {
        console.log(`  Fetching Fear & Greed Index (V3)...`);

        try {
            const endpoint = 'https://open-api-v3.coinglass.com/api/index/fear-greed-history';
            const res = await fetch(endpoint, {
                headers: {
                    'CG-API-KEY': API_KEY,
                    'accept': 'application/json'
                }
            });
            const json = await res.json();

            if (json.code === '0' && json.data) {
                const { dates, values } = json.data;
                // Filter data within the time window
                const mapped = [];
                for (let i = 0; i < dates.length; i++) {
                    const ts = dates[i];
                    if (ts >= startMs && ts <= endMs) {
                        mapped.push({
                            date: new Date(ts).toISOString().split('T')[0],
                            timestamp: ts,
                            fgi: values[i]
                        });
                    }
                }
                console.log(`      V3 Got ${mapped.length} items.`);
                return mapped;
            } else {
                console.warn('    V3 FGI Error:', json.msg || json);
            }
        } catch (e) {
            console.error('    V3 FGI Fetch Error:', e);
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

            const data = await fetchHistory(type, conf.symbol, conf.reactionStart);
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
