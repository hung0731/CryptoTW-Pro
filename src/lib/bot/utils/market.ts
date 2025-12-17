
// Fetch 24h ticker from OKX
async function fetchOkxTicker(symbol: string) {
    const instId = `${symbol.toUpperCase()}-USDT`
    console.log(`[OKX] Fetching ticker for: ${instId}`)

    try {
        const res = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!res.ok) {
            console.error(`[OKX] API Error: ${res.status} ${res.statusText}`)
            return null
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data || json.data.length === 0) {
            console.error(`[OKX] No data for: ${instId}`)
            return null
        }

        const data = json.data[0]
        return {
            symbol: symbol.toUpperCase() + 'USDT',
            lastPrice: data.last,
            priceChangePercent: ((parseFloat(data.last) - parseFloat(data.open24h)) / parseFloat(data.open24h) * 100).toFixed(2),
            highPrice: data.high24h,
            lowPrice: data.low24h,
            volume: data.vol24h,
            source: 'OKX'
        }
    } catch (e) {
        console.error('[OKX] Fetch Error:', e)
        return null
    }
}

// Fetch 24h ticker from Binance (備援)
async function fetchBinanceTicker(symbol: string) {
    const pair = `${symbol.toUpperCase()}USDT`
    console.log(`[Binance] Fetching ticker for: ${pair}`)

    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!res.ok) {
            console.error(`[Binance] API Error: ${res.status} ${res.statusText}`)
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
        console.error('[Binance] Fetch Error:', e)
        return null
    }
}

// 智能查詢：OKX 優先，Binance 備援
export async function fetchCryptoTicker(symbol: string) {
    const okxData = await fetchOkxTicker(symbol)
    if (okxData) {
        console.log(`[Ticker] Using OKX for ${symbol}`)
        return okxData
    }

    console.log(`[Ticker] OKX failed, trying Binance for ${symbol}`)
    const binanceData = await fetchBinanceTicker(symbol)
    if (binanceData) {
        console.log(`[Ticker] Using Binance for ${symbol}`)
        return binanceData
    }

    return null
}
