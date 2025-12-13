import { MarketSignals } from './signal-engine'

export interface AlertEvent {
    type: AlertType
    market: 'BTC'
    severity: 'low' | 'medium' | 'high'
    summary: string
    metrics: Record<string, any>
}

export type AlertType =
    | 'price_pump' | 'price_drop' | 'volatility_warning'
    | 'heavy_dump' | 'heavy_pump' | 'liquidation_flip'
    | 'oi_spike' | 'funding_high' | 'funding_flip_neg'
    | 'whale_shift' | 'whale_divergence'

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
        whale_lsr?: number;
        price_high_24h?: number;
        price_low_24h?: number;
        liquidations?: { total: number; long: number; short: number }
    },
    currentSignals: MarketSignals,
    previousState: MarketStateRecord | null
): AlertEvent[] {
    const alerts: AlertEvent[] = []

    if (!previousState) return alerts

    // Helper to calculate percentage change
    const pctChange = (curr: number, prev: number) => (curr - prev) / prev
    const formatPct = (val: number) => (val * 100).toFixed(2) + '%'

    // ==========================================
    // A 類｜價格與波動 (Price & Volatility)
    // ==========================================

    // A1. 快速漲跌 (1.5% Threshold)
    const priceChange = pctChange(currentData.price, previousState.price)

    if (priceChange <= -0.015) {
        alerts.push({
            type: 'price_drop',
            market: 'BTC',
            severity: 'high',
            summary: '⚠️ BTC 短時快速下跌',
            metrics: { change: formatPct(priceChange), price: currentData.price }
        })
    } else if (priceChange >= 0.015) {
        alerts.push({
            type: 'price_pump',
            market: 'BTC',
            severity: 'high',
            summary: '🚀 BTC 短時快速上漲',
            metrics: { change: '+' + formatPct(priceChange), price: currentData.price }
        })
    }

    // A2. 波動率警示 (如果價格變化小但其他指標劇烈)
    // 邏輯: 價格橫盤 (<0.5%) 但 OI 劇烈變化 (>3%) 表示蓄力
    // (這其實有點像 C1，但用來作為"波動前兆")
    const priceFlat = Math.abs(priceChange) < 0.005
    const oiChange = pctChange(currentData.oi, previousState.open_interest)

    if (priceFlat && Math.abs(oiChange) > 0.03) {
        alerts.push({
            type: 'volatility_warning',
            market: 'BTC',
            severity: 'medium',
            summary: '⚠️ 市場波動蓄力中 (量增價平)',
            metrics: { oi_change: formatPct(oiChange), price_change: formatPct(priceChange) }
        })
    }

    // ==========================================
    // B 類｜爆倉事件 (Liquidation)
    // ==========================================

    // B1. 大規模單邊爆倉 (> 30M USD & > 70% 佔比)
    const liqTotal = currentData.liquidations?.total || 0
    const liqLong = currentData.liquidations?.long || 0
    const liqShort = currentData.liquidations?.short || 0
    const LIQ_THRESHOLD = 30_000_000 // 30M

    if (liqTotal > LIQ_THRESHOLD) {
        if (liqLong > liqTotal * 0.7) {
            alerts.push({
                type: 'heavy_dump',
                market: 'BTC',
                severity: 'high',
                summary: '🔥 BTC 出現大規模多單爆倉',
                metrics: { total: (liqTotal / 1e6).toFixed(1) + 'M', long_ratio: formatPct(liqLong / liqTotal) }
            })
        } else if (liqShort > liqTotal * 0.7) {
            alerts.push({
                type: 'heavy_pump',
                market: 'BTC',
                severity: 'high',
                summary: '🔥 BTC 出現大規模空單爆倉',
                metrics: { total: (liqTotal / 1e6).toFixed(1) + 'M', short_ratio: formatPct(liqShort / liqTotal) }
            })
        }
    }

    // B2. 爆倉方向翻轉 (Liquidation Pressure Flip)
    if (previousState.liquidation_pressure !== '均衡' &&
        currentSignals.liquidation_pressure !== '均衡' &&
        previousState.liquidation_pressure !== currentSignals.liquidation_pressure) {

        alerts.push({
            type: 'liquidation_flip',
            market: 'BTC',
            severity: 'medium',
            summary: '🔄 爆倉壓力方向轉變',
            metrics: { from: previousState.liquidation_pressure, to: currentSignals.liquidation_pressure }
        })
    }

    // ==========================================
    // C 類｜槓桿與資金 (Leverage & Funding)
    // ==========================================

    // C1. OI 快速升溫 (同 A2 邏輯，如果 A2 沒觸發，這裡專注於槓桿層面)
    // 這裡我們只抓 "快速上升" > 5% 非常顯著
    if (oiChange > 0.05) {
        alerts.push({
            type: 'oi_spike',
            market: 'BTC',
            severity: 'medium',
            summary: '⚠️ 合約持倉量激增',
            metrics: { change: '+' + formatPct(oiChange), current_oi: (currentData.oi / 1e9).toFixed(2) + 'B' }
        })
    }

    // C2. 資金費率異常
    // 翻負
    if (previousState.funding_rate > 0 && currentData.funding < 0) {
        alerts.push({
            type: 'funding_flip_neg',
            market: 'BTC',
            severity: 'medium',
            summary: '⚠️ 資金費率轉負',
            metrics: { funding: (currentData.funding * 100).toFixed(4) + '%' }
        })
    }
    // 極端高 (> 0.05%)
    if (currentData.funding > 0.05 && currentData.funding > previousState.funding_rate) {
        alerts.push({
            type: 'funding_high',
            market: 'BTC',
            severity: 'high',
            summary: '⚠️ 資金費率過熱',
            metrics: { funding: (currentData.funding * 100).toFixed(4) + '%' }
        })
    }

    // ==========================================
    // D 類｜巨鯨行為 (Whale)
    // ==========================================

    // D1. 巨鯨狀態改變 (Whale Status Shift)
    // 忽略 "觀望" 的進出，只關注有明確方向的改變
    const importantStates = ['低調做多', '偏空', '防守對沖', '撤退中']
    if (previousState.whale_status !== currentSignals.whale_status &&
        (importantStates.includes(currentSignals.whale_status) || importantStates.includes(previousState.whale_status))) {

        alerts.push({
            type: 'whale_shift',
            market: 'BTC',
            severity: 'high',
            summary: `🐋 巨鯨行為改變：${currentSignals.whale_status}`,
            metrics: { from: previousState.whale_status, to: currentSignals.whale_status }
        })
    }

    // D2. 巨鯨與散戶背離 (Whale Divergence)
    // 散戶 (Global LSR) 看多 > 1.2，巨鯨 (Top LSR) 看空 < 0.8
    if (currentData.lsr > 1.2 && currentData.whale_lsr && currentData.whale_lsr < 0.8) {
        // Check if this is a NEW divergence (prev state didn't have it) usually we check state, 
        // but simple check: just alert if it persists? Better limit frequency in DB layer. 
        // For now we always generate, assuming notification service handles dupes or cron freq is low.
        alerts.push({
            type: 'whale_divergence',
            market: 'BTC',
            severity: 'high',
            summary: '🐋 ⚠️ 巨鯨與散戶方向分歧 (散戶多/巨鯨空)',
            metrics: { retail_lsr: currentData.lsr, whale_lsr: currentData.whale_lsr }
        })
    }
    // 反向背離
    if (currentData.lsr < 0.8 && currentData.whale_lsr && currentData.whale_lsr > 1.2) {
        alerts.push({
            type: 'whale_divergence',
            market: 'BTC',
            severity: 'high',
            summary: '🐋 ✅ 巨鯨與散戶方向分歧 (散戶空/巨鯨多)',
            metrics: { retail_lsr: currentData.lsr, whale_lsr: currentData.whale_lsr }
        })
    }

    return alerts
}
