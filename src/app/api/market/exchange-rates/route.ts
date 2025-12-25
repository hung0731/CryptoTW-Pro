import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getHoyabitPrices } from '@/lib/hoyabit';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute

interface ExchangeRates {
    max: { buy: number; sell: number } | null;
    bito: { buy: number; sell: number } | null;
    hoya: { buy: number; sell: number } | null;
    btcPrice: number | null;
    ethPrice: number | null;
    usdTwd: number | null;
    updatedAt: string;
}

// GET /api/market/exchange-rates - Get USDT/TWD rates from 3 exchanges
export async function GET() {
    try {
        // Parallel fetch from all sources
        const [hoyaPrices, bitoRes, maxRes, btcRes, ethRes] = await Promise.all([
            // HoyaBit
            getHoyabitPrices().catch(e => {
                logger.warn('HoyaBit API Error', e, { feature: 'exchange-rates' });
                return null;
            }),

            // BitoPro
            fetch('https://api.bitopro.com/v3/tickers/usdt_twd', {
                next: { revalidate: 60 }
            })
                .then(r => r.json())
                .catch(e => {
                    logger.warn('BitoPro API Error', e, { feature: 'exchange-rates' });
                    return null;
                }),

            // MAX
            fetch('https://max-api.maicoin.com/api/v2/tickers/usdttwd', {
                next: { revalidate: 60 }
            })
                .then(r => r.json())
                .catch(e => {
                    logger.warn('MAX API Error', e, { feature: 'exchange-rates' });
                    return null;
                }),

            // BTC Price from Binance
            fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
                next: { revalidate: 60 }
            })
                .then(r => r.json())
                .catch(e => {
                    logger.warn('Binance BTC API Error', e, { feature: 'exchange-rates' });
                    return null;
                }),

            // ETH Price from Binance
            fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT', {
                next: { revalidate: 60 }
            })
                .then(r => r.json())
                .catch(e => {
                    logger.warn('Binance ETH API Error', e, { feature: 'exchange-rates' });
                    return null;
                })
        ]);

        // Parse exchange rates
        const rates: ExchangeRates = {
            max: maxRes?.last ? {
                buy: parseFloat(maxRes.buy) || parseFloat(maxRes.last),
                sell: parseFloat(maxRes.sell) || parseFloat(maxRes.last)
            } : null,

            bito: bitoRes?.data?.lastPrice ? {
                buy: parseFloat(bitoRes.data.lastPrice),
                sell: parseFloat(bitoRes.data.lastPrice)
            } : null,

            hoya: (hoyaPrices && hoyaPrices.buy && hoyaPrices.sell) ? {
                buy: hoyaPrices.buy,
                sell: hoyaPrices.sell
            } : null,

            btcPrice: btcRes?.lastPrice ? parseFloat(btcRes.lastPrice) : null,
            ethPrice: ethRes?.lastPrice ? parseFloat(ethRes.lastPrice) : null,

            // Approximate USD/TWD rate (average of exchange rates)
            usdTwd: null,

            updatedAt: new Date().toISOString()
        };

        // Calculate approximate USD/TWD from the average
        const validRates = [rates.max?.buy, rates.bito?.buy, rates.hoya?.buy].filter(Boolean) as number[];
        if (validRates.length > 0) {
            rates.usdTwd = validRates.reduce((a, b) => a + b, 0) / validRates.length;
        }

        return NextResponse.json(rates);
    } catch (error) {
        logger.error('Exchange rates API error', error, { feature: 'exchange-rates' });
        return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
    }
}
