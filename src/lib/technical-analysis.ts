import { logger } from '@/lib/logger'

export function calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50

    let gains = 0
    let losses = 0

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1]
        if (diff >= 0) {
            gains += diff
        } else {
            losses += Math.abs(diff)
        }
    }

    let avgGain = gains / period
    let avgLoss = losses / period

    // Smoothed RSI
    for (let i = period + 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1]
        let currentGain = 0
        let currentLoss = 0
        if (diff >= 0) {
            currentGain = diff
        } else {
            currentLoss = Math.abs(diff)
        }

        avgGain = (avgGain * (period - 1) + currentGain) / period
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period
    }

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
}

export async function fetchBinanceRSI(symbol: string = 'BTCUSDT', interval: string = '1h'): Promise<number> {
    try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=20`)
        const data = await res.json()

        // Binance kline: [time, open, high, low, close, volume, ...]
        // We need closes
        const closes = data.map((k: any[]) => parseFloat(k[4]))

        return parseFloat(calculateRSI(closes).toFixed(2))
    } catch (e) {
        logger.error('Binance RSI fetch error', e as Error, { feature: 'technical-analysis' })
        return 50 // Default neutral
    }
}
