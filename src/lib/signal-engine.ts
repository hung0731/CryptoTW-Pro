/**
 * Signal Engine - 市場訊號規則層
 * 
 * 職責：將原始數據轉換為「狀態值」
 * AI 只讀取這些狀態值，不直接處理原始數據
 */

// ===== 類型定義 =====

export type LeverageStatus = '升溫' | '降溫' | '過熱' | '正常'
export type WhaleStatus = '低調做多' | '防守對沖' | '偏空' | '撤退中' | '觀望'
export type LiquidationPressure = '上方壓力' | '下方壓力' | '均衡'
export type MarketFeeling = '偏多' | '偏空' | '擁擠' | '混亂' | '中性'

export interface MarketSignals {
    // 狀態值
    leverage_status: LeverageStatus
    whale_status: WhaleStatus
    liquidation_pressure: LiquidationPressure
    market_feeling: MarketFeeling

    // 證據（用於顯示）
    evidence: {
        leverage: string[]
        whale: string[]
        liquidation: string[]
    }

    // 關鍵數值（用於 AI 引用）
    key_metrics: {
        oi_change_24h: number | null
        funding_rate: number | null
        long_short_ratio: number | null
        top_trader_ratio: number | null
        liquidation_above_usd: number | null
        liquidation_below_usd: number | null
        price_change_24h: number | null
    }

    // 爆倉區間
    liquidation_zones: {
        above_start: number | null
        above_end: number | null
        below_start: number | null
        below_end: number | null
    }
}

// ===== 判斷規則 =====

/**
 * 判斷槓桿狀態
 */
function detectLeverageStatus(
    oiChange24h: number | null,
    fundingRate: number | null
): { status: LeverageStatus; evidence: string[] } {
    const evidence: string[] = []

    // 無數據
    if (oiChange24h === null && fundingRate === null) {
        return { status: '正常', evidence: ['數據不足'] }
    }

    const oiUp = oiChange24h !== null && oiChange24h > 2
    const oiDown = oiChange24h !== null && oiChange24h < -2
    const fundingHigh = fundingRate !== null && fundingRate > 0.05
    const fundingExtreme = fundingRate !== null && fundingRate > 0.1
    const fundingNegative = fundingRate !== null && fundingRate < -0.01

    // 紀錄證據
    if (oiChange24h !== null) {
        const sign = oiChange24h >= 0 ? '+' : ''
        evidence.push(`OI 24h ${sign}${oiChange24h.toFixed(1)}%`)
    }
    if (fundingRate !== null) {
        evidence.push(`Funding ${(fundingRate * 100).toFixed(3)}%`)
    }

    // 判斷邏輯
    if (oiUp && fundingExtreme) {
        return { status: '過熱', evidence }
    }
    if (oiUp && fundingHigh) {
        return { status: '升溫', evidence }
    }
    if (oiDown) {
        return { status: '降溫', evidence }
    }
    if (fundingNegative && oiUp) {
        return { status: '升溫', evidence } // 空頭被擠，資金進場
    }

    return { status: '正常', evidence }
}

/**
 * 判斷巨鯨狀態
 */
function detectWhaleStatus(
    topTraderRatio: number | null,
    oiChange24h: number | null,
    priceChange24h: number | null,
    longShortRatio: number | null,
    whaleSentiment: string | null // From Hyperliquid
): { status: WhaleStatus; evidence: string[] } {
    const evidence: string[] = []

    // 優先使用 Hyperliquid 巨鯨數據
    if (whaleSentiment) {
        evidence.push(`Hyperliquid 巨鯨: ${whaleSentiment}`)

        if (whaleSentiment === '偏多') {
            return { status: '低調做多', evidence }
        }
        if (whaleSentiment === '偏空') {
            return { status: '偏空', evidence }
        }
        // 中性 -> 繼續其他判斷
    }

    // 無數據 fallback 到 Top Trader
    if (topTraderRatio === null && !whaleSentiment) {
        return { status: '觀望', evidence: ['巨鯨數據不足'] }
    }

    // 如果有 Top Trader 數據，用它判斷
    if (topTraderRatio !== null) {
        const bullishRatio = topTraderRatio > 1.2
        const bearishRatio = topTraderRatio < 0.8
        const oiUp = oiChange24h !== null && oiChange24h > 2
        const oiDown = oiChange24h !== null && oiChange24h < -2
        const priceSideways = priceChange24h !== null && Math.abs(priceChange24h) < 2
        const ratioConverging = longShortRatio !== null && Math.abs(longShortRatio - 1) < 0.1

        // 紀錄證據
        evidence.push(`Top Trader 多空比 ${topTraderRatio.toFixed(2)}`)
        if (oiChange24h !== null) {
            const sign = oiChange24h >= 0 ? '+' : ''
            evidence.push(`OI ${sign}${oiChange24h.toFixed(1)}%`)
        }
        if (longShortRatio !== null) {
            evidence.push(`全網多空比 ${longShortRatio.toFixed(2)}`)
        }

        // 判斷邏輯
        // 低調做多：大戶偏多 + OI 上升 + 價格盤整
        if (bullishRatio && oiUp && priceSideways) {
            return { status: '低調做多', evidence }
        }

        // 防守對沖：OI 上升 + 價格不動 + 多空比收斂
        if (oiUp && priceSideways && ratioConverging) {
            return { status: '防守對沖', evidence }
        }

        // 撤退中：OI 下降
        if (oiDown) {
            return { status: '撤退中', evidence }
        }

        // 偏空
        if (bearishRatio) {
            return { status: '偏空', evidence }
        }

        // 偏多（簡單判斷）
        if (bullishRatio) {
            return { status: '低調做多', evidence }
        }

        return { status: '觀望', evidence }
    }

    // Fallback: 有 Hyperliquid 中性數據但無 Top Trader
    return { status: '觀望', evidence: ['巨鯨狀態中性'] }
}

/**
 * 判斷爆倉壓力
 */
function detectLiquidationPressure(
    aboveUsd: number | null,
    belowUsd: number | null
): { status: LiquidationPressure; evidence: string[] } {
    const evidence: string[] = []

    // 無數據
    if (aboveUsd === null || belowUsd === null) {
        return { status: '均衡', evidence: ['爆倉數據不足'] }
    }

    const formatUsd = (n: number) => {
        if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
        if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`
        return `${(n / 1e3).toFixed(0)}K`
    }

    evidence.push(`上方空單 ${formatUsd(aboveUsd)}`)
    evidence.push(`下方多單 ${formatUsd(belowUsd)}`)

    // 判斷邏輯
    if (aboveUsd > belowUsd * 1.5) {
        const ratio = (aboveUsd / belowUsd).toFixed(1)
        evidence.push(`上方壓力 ${ratio}x`)
        return { status: '上方壓力', evidence }
    }

    if (belowUsd > aboveUsd * 1.5) {
        const ratio = (belowUsd / aboveUsd).toFixed(1)
        evidence.push(`下方壓力 ${ratio}x`)
        return { status: '下方壓力', evidence }
    }

    return { status: '均衡', evidence }
}

/**
 * 綜合判斷市場體感
 */
function detectMarketFeeling(
    leverageStatus: LeverageStatus,
    whaleStatus: WhaleStatus,
    liquidationPressure: LiquidationPressure,
    priceChange24h: number | null
): MarketFeeling {
    // 過熱 = 擁擠
    if (leverageStatus === '過熱') {
        return '擁擠'
    }

    // 巨鯨做多 + 上方壓力 = 偏多（可能軋空）
    if (whaleStatus === '低調做多' && liquidationPressure === '上方壓力') {
        return '偏多'
    }

    // 巨鯨偏空 + 下方壓力 = 偏空
    if (whaleStatus === '偏空' && liquidationPressure === '下方壓力') {
        return '偏空'
    }

    // 巨鯨撤退 = 混亂
    if (whaleStatus === '撤退中') {
        return '混亂'
    }

    // 價格導向判斷
    if (priceChange24h !== null) {
        if (priceChange24h > 3) return '偏多'
        if (priceChange24h < -3) return '偏空'
    }

    // 槓桿升溫 + 價格向上 = 偏多
    if (leverageStatus === '升溫' && priceChange24h && priceChange24h > 0) {
        return '偏多'
    }

    return '中性'
}

// ===== 主函數 =====

export interface RawMarketData {
    // OI 相關
    oi_change_24h?: number
    total_oi?: number

    // Funding
    funding_rate?: number

    // 多空比
    long_short_ratio?: number
    top_trader_long_short_ratio?: number

    // 爆倉
    liquidation_above_usd?: number
    liquidation_below_usd?: number
    liquidation_above_price?: number
    liquidation_below_price?: number

    // 價格
    price?: number
    price_change_24h?: number
    price_high_24h?: number
    price_low_24h?: number

    // 巨鯨
    whale_long_count?: number
    whale_short_count?: number
    whale_long_value?: number
    whale_short_value?: number
    whale_sentiment?: string // '偏多' | '偏空' | '中性' from Hyperliquid
}

/**
 * 主入口：從原始數據生成市場訊號
 */
export function generateMarketSignals(data: RawMarketData): MarketSignals {
    // 1. 判斷各模組狀態
    const leverage = detectLeverageStatus(
        data.oi_change_24h ?? null,
        data.funding_rate ?? null
    )

    const whale = detectWhaleStatus(
        data.top_trader_long_short_ratio ?? null,
        data.oi_change_24h ?? null,
        data.price_change_24h ?? null,
        data.long_short_ratio ?? null,
        data.whale_sentiment ?? null // Hyperliquid sentiment
    )

    const liquidation = detectLiquidationPressure(
        data.liquidation_above_usd ?? null,
        data.liquidation_below_usd ?? null
    )

    // 2. 綜合判斷市場體感
    const marketFeeling = detectMarketFeeling(
        leverage.status,
        whale.status,
        liquidation.status,
        data.price_change_24h ?? null
    )

    // 3. 組裝輸出
    return {
        leverage_status: leverage.status,
        whale_status: whale.status,
        liquidation_pressure: liquidation.status,
        market_feeling: marketFeeling,

        evidence: {
            leverage: leverage.evidence,
            whale: whale.evidence,
            liquidation: liquidation.evidence,
        },

        key_metrics: {
            oi_change_24h: data.oi_change_24h ?? null,
            funding_rate: data.funding_rate ?? null,
            long_short_ratio: data.long_short_ratio ?? null,
            top_trader_ratio: data.top_trader_long_short_ratio ?? null,
            liquidation_above_usd: data.liquidation_above_usd ?? null,
            liquidation_below_usd: data.liquidation_below_usd ?? null,
            price_change_24h: data.price_change_24h ?? null,
        },

        liquidation_zones: {
            above_start: data.liquidation_above_price ?? null,
            above_end: data.liquidation_above_price ? data.liquidation_above_price * 1.03 : null,
            below_start: data.liquidation_below_price ? data.liquidation_below_price * 0.97 : null,
            below_end: data.liquidation_below_price ?? null,
        }
    }
}

/**
 * 比較兩個狀態是否有重大變化（用於推播決策）
 */
export function hasSignificantChange(
    prev: MarketSignals | null,
    curr: MarketSignals
): { changed: boolean; changes: string[] } {
    if (!prev) {
        return { changed: false, changes: [] }
    }

    const changes: string[] = []

    if (prev.leverage_status !== curr.leverage_status) {
        changes.push(`槓桿狀態：${prev.leverage_status} → ${curr.leverage_status}`)
    }

    if (prev.whale_status !== curr.whale_status) {
        changes.push(`巨鯨狀態：${prev.whale_status} → ${curr.whale_status}`)
    }

    if (prev.liquidation_pressure !== curr.liquidation_pressure) {
        changes.push(`爆倉壓力：${prev.liquidation_pressure} → ${curr.liquidation_pressure}`)
    }

    if (prev.market_feeling !== curr.market_feeling) {
        changes.push(`市場體感：${prev.market_feeling} → ${curr.market_feeling}`)
    }

    return {
        changed: changes.length > 0,
        changes
    }
}
