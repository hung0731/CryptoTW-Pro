import { detectAlerts, MarketStateRecord } from '../src/lib/alert-engine';
import { MarketSignals } from '../src/lib/signal-engine';

function runTest(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ ${name} Passed`);
    } catch (e: any) {
        console.error(`❌ ${name} Failed: ${e.message}`);
    }
}

console.log('--- Testing Alert Logic ---');

const mockPrevState: MarketStateRecord = {
    price: 90000,
    open_interest: 1000000000, // 1B
    funding_rate: 0.01,
    long_short_ratio: 1.0,
    leverage_status: '正常',
    whale_status: '觀望',
    liquidation_pressure: '均衡',
    updated_at: new Date().toISOString()
};

const baseSignals: MarketSignals = {
    leverage_status: '正常',
    whale_status: '觀望',
    liquidation_pressure: '均衡',
    market_feeling: '中性',
    evidence: { leverage: [], whale: [], liquidation: [] },
    key_metrics: {
        oi_change_24h: 0, funding_rate: 0.01, long_short_ratio: 1, top_trader_ratio: 1,
        liquidation_above_usd: 0, liquidation_below_usd: 0, price_change_24h: 0
    },
    liquidation_zones: { above_start: 0, above_end: 0, below_start: 0, below_end: 0 }
};

// Test 1: Price Drop Alert
runTest('Price Drop Alert', () => {
    const currentPrice = 88000; // -2.2% drop (threshold -1.5%)
    const alerts = detectAlerts(
        {
            price: currentPrice,
            oi: 1000000000,
            funding: 0.01,
            lsr: 1.0,
            liquidations: { total: 0, long: 0, short: 0 }
        },
        baseSignals,
        mockPrevState
    );
    if (alerts.length !== 1 || alerts[0].type !== 'price_drop') {
        throw new Error(`Expected price_drop alert, got ${JSON.stringify(alerts)}`);
    }
});

// Test 2: OI Spike Alert
runTest('OI Spike Alert', () => {
    const currentPrice = 90100; // Stable (+0.1%)
    const currentOI = 1100000000; // +10% increase (threshold > 5% or >3% w/ stable price)

    // Logic: OI Change > 5% -> 'oi_spike' (C1)
    // Logic: Price Flat (<0.5%) & OI Change > 3% -> 'volatility_warning' (A2)
    // Both might trigger.

    const alerts = detectAlerts(
        {
            price: currentPrice,
            oi: currentOI,
            funding: 0.01,
            lsr: 1.0,
            liquidations: { total: 0, long: 0, short: 0 }
        },
        baseSignals,
        mockPrevState
    );

    // Check if at least oi_spike or volatility_warning is present
    const types = alerts.map(a => a.type);
    if (!types.includes('oi_spike') && !types.includes('volatility_warning')) {
        throw new Error(`Expected volatility alert, got ${types.join(', ')}`);
    }
});

// Test 3: Liquidation Heavy Dump
runTest('Liquidation Dump Alert', () => {
    const alerts = detectAlerts(
        {
            price: 85000,
            oi: 900000000,
            funding: 0.01,
            lsr: 1.0,
            liquidations: {
                total: 40000000, // 40M (>30M)
                long: 35000000,  // >70% long
                short: 5000000
            }
        },
        baseSignals,
        mockPrevState
    );

    const types = alerts.map(a => a.type);
    if (!types.includes('heavy_dump')) {
        throw new Error(`Expected heavy_dump alert, got ${types.join(', ')}`);
    }
});

// Test 4: Funding Flip
runTest('Funding Flip Alert', () => {
    const alerts = detectAlerts(
        {
            price: 90000,
            oi: 1000000000,
            funding: -0.005, // Negative
            lsr: 1.0,
            liquidations: { total: 0, long: 0, short: 0 }
        },
        baseSignals,
        mockPrevState
    );

    if (!alerts.some(a => a.type === 'funding_flip_neg')) {
        throw new Error(`Expected funding_flip_neg alert`);
    }
});
