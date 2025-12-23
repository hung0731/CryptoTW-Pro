import { logger } from '@/lib/logger'

// Fetch 24h ticker from OKX
async function fetchOkxTicker(symbol: string) {
    const instId = `${symbol.toUpperCase()}-USDT`
    logger.debug(`[OKX] Fetching ticker for: ${instId}`)

    try {
        const res = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!res.ok) {
            logger.warn(`[OKX] API Error: ${res.status} ${res.statusText}`)
            return null
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data || json.data.length === 0) {
            logger.warn(`[OKX] No data for: ${instId}`)
            return null
        }
    } catch (e) {
        logger.error('[OKX] Fetch Error:', e as Error)
        return null
    }
}

// Fetch 24h ticker from Binance (備援)
async function fetchBinanceTicker(symbol: string) {
    const pair = `${symbol.toUpperCase()}USDT`
    logger.debug(`[Binance] Fetching ticker for: ${pair}`)

    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!res.ok) {
            logger.warn(`[Binance] API Error: ${res.status} ${res.statusText}`)
            return null
        }

        const data = await res.json()
        return {
            symbol: data.symbol,
            lastPrice: data.lastPrice,
            priceChangePercent: data.priceChangePercent,
            highPrice: data.highPrice,
            lowPrice: data.lowPrice,
            volume: data.volume,
            source: 'Binance'
        }
    } catch (e) {
        logger.error('[Binance] Fetch Error:', e as Error)
        return null
    }
}

// 智能查詢：OKX 優先，Binance 備援
export async function fetchCryptoTicker(symbol: string) {
    const okxData = await fetchOkxTicker(symbol)
    if (okxData) {
        // Reduced noise
        return okxData
    }

    logger.info(`[Ticker] OKX failed, trying Binance for ${symbol}`)
    const binanceData = await fetchBinanceTicker(symbol)
    if (binanceData) {
        return binanceData
    }

    return null
}
