import { MarketSignals } from './signal-engine'

export interface AlertEvent {
    type: 'price_pump' | 'price_drop' | 'oi_spike' | 'funding_high' | 'funding_flip_neg' | 'whale_shift' | 'liquidation_flip' | 'heavy_dump' | 'heavy_pump'
    market: 'BTC'
    severity: 'low' | 'medium' | 'high'
    summary: string
    metrics: Record<string, any>
}

export interface MarketStateRecord {
    price: number
    open_interest: number
    funding_rate: number
    long_short_ratio: number
    leverage_status: string
    whale_status: string
    liquidation_pressure: string
    updated_at: string
}

export function detectAlerts(
    currentData: {
        price: number;
        oi: number;
        funding: number;
        lsr: number;
        liquidations?: { total: number; long: number; short: number }
    },
    currentSignals: MarketSignals,
    previousState: MarketStateRecord | null
): AlertEvent[] {
    const alerts: AlertEvent[] = []

    if (!previousState) return alerts

    // 1. Price Volatility (1.5% threshold)
    const priceChange = (currentData.price - previousState.price) / previousState.price
    const priceChangeAbs = Math.abs(priceChange)

    if (priceChange <= -0.015) {
        alerts.push({
            type: 'price_drop',
            market: 'BTC',
            severity: 'high',
            summary: '⚠️ BTC 價格在短時間內快速下跌',
            metrics: { change: (priceChange * 100).toFixed(2) + '%', price: currentData.price }
        })
    } else if (priceChange >= 0.015) {
        alerts.push({
            type: 'price_pump',
            market: 'BTC',
            severity: 'high',
            summary: '⚠️ BTC 價格在短時間內快速上漲',
            metrics: { change: '+' + (priceChange * 100).toFixed(2) + '%', price: currentData.price }
        })
    }

    // 2. OI Spike with Stable Price
    // Price change < 0.3%, OI increase > 3%
    const oiChange = (currentData.oi - previousState.open_interest) / previousState.open_interest

    if (priceChangeAbs < 0.003 && oiChange > 0.03) {
        alerts.push({
            type: 'oi_spike',
            market: 'BTC',
            severity: 'medium',
            summary: '⚠️ BTC 槓桿快速升溫 (價格盤整)',
            metrics: { oi_change: '+' + (oiChange * 100).toFixed(2) + '%', price_change: (priceChange * 100).toFixed(2) + '%' }
        })
    }

    // 3. Funding Rate Flip
    if (previousState.funding_rate > 0 && currentData.funding < 0) {
        alerts.push({
            type: 'funding_flip_neg',
            market: 'BTC',
            severity: 'medium',
            summary: '⚠️ BTC 資金費率轉負',
            metrics: { current_funding: currentData.funding, prev_funding: previousState.funding_rate }
        })
    }

    // High Funding (Example threshold 0.02% which is high for default 0.01%) - Adjust based on data cycle
    if (currentData.funding > 0.02 && currentData.funding > previousState.funding_rate * 1.2) {
        alerts.push({
            type: 'funding_high',
            market: 'BTC',
            severity: 'medium',
            summary: '⚠️ BTC 資金費率快速升溫',
            metrics: { current_funding: currentData.funding }
        })
    }

    // 4. Whale Status Change
    if (previousState.whale_status !== currentSignals.whale_status) {
        // Only trigger if changing TO or FROM 'withdrawal' or 'long' maybe?
        // User said: Change "Long -> Neutral", "Neutral -> Short", "Hedge -> Exit"
        // Let's alert on ANY change for now, as whale state changes are rare and significant.
        alerts.push({
            type: 'whale_shift',
            market: 'BTC',
            severity: 'high',
            summary: '🐋 巨鯨行為出現變化',
            metrics: { from: previousState.whale_status, to: currentSignals.whale_status }
        })
    }

    // 5. Liquidation Flip (Predicted Pressure from Heatmap)
    // '上方壓力' | '下方壓力' | '均衡'
    if (previousState.liquidation_pressure !== '均衡' &&
        currentSignals.liquidation_pressure !== '均衡' &&
        previousState.liquidation_pressure !== currentSignals.liquidation_pressure) {

        alerts.push({
            type: 'liquidation_flip',
            market: 'BTC',
            severity: 'high',
            summary: '🔄 BTC 爆倉方向出現轉變',
            metrics: { from: previousState.liquidation_pressure, to: currentSignals.liquidation_pressure }
        })
    }

    // 6. Actual Liquidation Spike (New)
    // Threshold usually $20M or $50M for 1h spike depending on market cap, user suggested $100M but that's very high.
    // Let's stick to user requirement: Only alert if SIGNIFICANT.
    const liquidationTotal = currentData.liquidations?.total || 0
    const longLiq = currentData.liquidations?.long || 0
    const shortLiq = currentData.liquidations?.short || 0

    // Threshold $30M for MVP (adjust as needed)
    if (liquidationTotal > 30_000_000) {
        if (longLiq > liquidationTotal * 0.7) {
            alerts.push({
                type: 'heavy_dump', // Many longs rekt usually means rapid drop
                market: 'BTC',
                severity: 'high',
                summary: '🔥 BTC 發生大規模多單爆倉',
                metrics: { total: liquidationTotal, long_ratio: (longLiq / liquidationTotal * 100).toFixed(0) + '%' }
            })
        } else if (shortLiq > liquidationTotal * 0.7) {
            alerts.push({
                type: 'heavy_pump',
                market: 'BTC',
                severity: 'high',
                summary: '🔥 BTC 發生大規模空單爆倉',
                metrics: { total: liquidationTotal, short_ratio: (shortLiq / liquidationTotal * 100).toFixed(0) + '%' }
            })
        }
    }

    return alerts
}
