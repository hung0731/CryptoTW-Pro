
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_KEY = process.env.COINGLASS_API_KEY;
const V4_URL = 'https://open-api-v4.coinglass.com';
const V3_URL = 'https://open-api-v3.coinglass.com'; // Confirmed in codebase for OI

if (!API_KEY) {
    console.error('❌ COINGLASS_API_KEY is missing');
    process.exit(1);
}

const headers = {
    'accept': 'application/json',
    'CG-API-KEY': API_KEY, // Works for both V3 (confirmed in route.ts) and V4
    'content-type': 'application/json'
};

async function testEndpoint(name: string, baseUrl: string, path: string, params: Record<string, any> = {}) {
    console.log(`\n🔍 Testing ${name} [${baseUrl}${path}]...`);

    // Build URL with query params
    const url = new URL(baseUrl + path);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));

    try {
        const res = await fetch(url.toString(), { headers });
        if (!res.ok) {
            console.error(`❌ Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Body snippets:', text.slice(0, 200));
            return;
        }

        const json: any = await res.json();
        if (json.code !== '0') {
            console.error(`❌ API Error: ${json.msg}`);
            return;
        }

        const data = json.data;
        const isArray = Array.isArray(data);
        console.log(`✅ Success! Data type: ${isArray ? 'Array' : typeof data}`);
        if (isArray) {
            console.log(`Length: ${data.length}`);
            if (data.length > 0) {
                console.log('Sample[0]:', JSON.stringify(data[0], null, 2));
            }
        } else {
            // For V3 OI, data might be [{t, o, h, l, c}]
            console.log('Sample data keys:', Object.keys(data).join(', '));
            if (Array.isArray(data)) console.log('Sample[0]:', JSON.stringify(data[0], null, 2));
        }

    } catch (e) {
        console.error('❌ Fetch failed:', e);
    }
}

async function run() {
    const now = Math.floor(Date.now() / 1000);
    const start = now - 86400 * 30; // 30 days

    // 1. OI History (V3 confirmed from route.ts)
    await testEndpoint(
        'OI History (V3)',
        V3_URL,
        '/api/futures/openInterest/ohlc-aggregated-history',
        { symbol: 'BTC', interval: '1d', startTime: start, endTime: now }
    );

    // 2. Funding Rate History (V4 confirmed existence, adding exchange)
    // https://open-api-v4.coinglass.com/api/futures/funding-rate/history
    await testEndpoint(
        'Funding History (V4)',
        V4_URL,
        '/api/futures/funding-rate/history',
        {
            symbol: 'BTCUSDT',
            exchange: 'Binance', // Confirmed required
            interval: '1d',
            limit: 10,
            start_time: start * 1000,
            end_time: now * 1000
        }
    );

    // 3. Price History (V4 confirmed by User)
    // https://open-api-v4.coinglass.com/api/futures/price/history
    await testEndpoint(
        'Price History (V4 User Provided)',
        V4_URL,
        '/api/futures/price/history',
        {
            symbol: 'BTCUSDT',
            exchange: 'Binance',
            interval: '1d',
            limit: 10,
            start_time: start * 1000,
            end_time: now * 1000
        }
    );
}

run();
