/**
 * Coinglass 交易市場狀態服務
 * 
 * 本功能的目的不是提供交易數據，而是將交易數據轉為「市場結構狀態」，
 * 輔助使用者理解風險位置。
 * 
 * v1 僅支援 BTC
 */

import { getCache, setCache, CacheTTL } from './cache'
import { coinglassV4Request } from './coinglass'

// ============================================
// 狀態類型定義
// ============================================

export type FundingState = '偏多' | '中性' | '偏空'
export type LongShortState = '多方佔優' | '相對平衡' | '空方佔優'
export type LiquidationState = '高' | '中' | '低'

export interface MarketState {
    fundingState: FundingState
    longShortState: LongShortState
    liquidationState: LiquidationState
    updatedAt: number // timestamp
}

// ============================================
// 狀態轉換閾值
// ============================================

const THRESHOLDS = {
    // 資金費率閾值 (0.0002 = 0.02%)
    FUNDING_BULLISH: 0.0002,
    FUNDING_BEARISH: -0.0002,

    // 多空比閾值 (百分比)
    LONG_SHORT_BULLISH: 55,
    LONG_SHORT_BEARISH: 45,

    // 清算壓力閾值 (USD)
    LIQUIDATION_HIGH: 100_000_000,  // $100M
    LIQUIDATION_LOW: 20_000_000,    // $20M
}

// ============================================
// 狀態轉換函數
// ============================================

function convertFundingState(rate: number): FundingState {
    if (rate > THRESHOLDS.FUNDING_BULLISH) return '偏多'
    if (rate < THRESHOLDS.FUNDING_BEARISH) return '偏空'
    return '中性'
}

function convertLongShortState(longRate: number): LongShortState {
    if (longRate > THRESHOLDS.LONG_SHORT_BULLISH) return '多方佔優'
    if (longRate < THRESHOLDS.LONG_SHORT_BEARISH) return '空方佔優'
    return '相對平衡'
}

function convertLiquidationState(totalUsd: number): LiquidationState {
    if (totalUsd > THRESHOLDS.LIQUIDATION_HIGH) return '高'
    if (totalUsd < THRESHOLDS.LIQUIDATION_LOW) return '低'
    return '中'
}

// ============================================
// 主函數：獲取市場狀態
// ============================================

const CACHE_KEY = 'market_state:BTC'
const CACHE_TTL = 300 // 5 分鐘

export async function getMarketState(symbol: 'BTC' = 'BTC'): Promise<MarketState | null> {
    // 檢查快取
    const cached = getCache<MarketState>(CACHE_KEY)
    if (cached) {
        return cached
    }

    try {
        // 並行獲取三個指標
        const [fundingData, longShortData, liquidationData] = await Promise.all([
            fetchFundingRate(symbol),
            fetchLongShortRatio(symbol),
            fetchLiquidation(symbol)
        ])

        const state: MarketState = {
            fundingState: convertFundingState(fundingData),
            longShortState: convertLongShortState(longShortData),
            liquidationState: convertLiquidationState(liquidationData),
            updatedAt: Date.now()
        }

        // 設定快取
        setCache(CACHE_KEY, state, CACHE_TTL)

        return state
    } catch (error) {
        console.error('[MarketState] Error fetching data:', error)
        return null
    }
}

// ============================================
// 資料獲取函數
// ============================================

async function fetchFundingRate(symbol: string): Promise<number> {
    try {
        const data = await coinglassV4Request<any[]>(
            '/api/futures/funding-rate/exchange-list',
            { symbol }
        )

        if (!data || data.length === 0) return 0

        const marginList = data[0]?.stablecoin_margin_list || []
        if (marginList.length === 0) return 0

        // 計算平均資金費率
        const rates = marginList.map((e: any) => e.funding_rate).filter((r: any) => r !== undefined)
        const avgRate = rates.length > 0
            ? rates.reduce((a: number, b: number) => a + b, 0) / rates.length
            : 0

        return avgRate
    } catch (error) {
        console.error('[MarketState] Funding rate error:', error)
        return 0
    }
}

async function fetchLongShortRatio(symbol: string): Promise<number> {
    try {
        const data = await coinglassV4Request<any[]>(
            '/api/futures/global-long-short-account-ratio/history',
            { symbol, exchange: 'Binance', interval: '1h', limit: 1 }
        )

        if (!data || data.length === 0) return 50

        const latest = data[0]
        let longRate = latest?.longRate || 50

        // 如果數值 <= 1，轉換為百分比
        if (longRate <= 1) {
            longRate = longRate * 100
        }

        return longRate
    } catch (error) {
        console.error('[MarketState] Long/Short error:', error)
        return 50
    }
}

async function fetchLiquidation(symbol: string): Promise<number> {
    try {
        const data = await coinglassV4Request<any[]>(
            '/api/futures/liquidation/history',
            { symbol, interval: '1d', limit: 1 }
        )

        if (!data || data.length === 0) return 0

        const latest = data[0]
        const longLiq = latest?.longLiquidationUsd || 0
        const shortLiq = latest?.shortLiquidationUsd || 0

        // 回傳總清算金額（不區分方向）
        return longLiq + shortLiq
    } catch (error) {
        console.error('[MarketState] Liquidation error:', error)
        return 0
    }
}
