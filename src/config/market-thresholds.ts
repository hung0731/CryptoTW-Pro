/**
 * Market Status Interpretation Thresholds
 * Centralized configuration to avoid hardcoded values in services.
 */

export const MARKET_THRESHOLDS = {
    // Funding Rate (per 8h)
    FUNDING: {
        EXTREME_HIGH: 0.08, // 0.08% or higher
        HIGH: 0.03,        // 0.03% to 0.08%
        NEUTRAL_UPPER: 0.01,
        NEUTRAL_LOWER: -0.01,
    },

    // Liquidation (USD)
    LIQUIDATION: {
        H24_EXTREME: 300_000_000, // 300M USD
        H24_HIGH: 100_000_000,    // 100M USD
        H1_EXTREME: 150_000_000,  // 150M USD
        H1_HIGH: 50_000_000,      // 50M USD
    },

    // Fear & Greed Index
    FEAR_GREED: {
        EXTREME_FEAR: 25,
        FEAR: 30,
        NEUTRAL: 45,
        GREED: 55,
        EXTREME_GREED: 75,
    },

    // Whale Positioning (Long %)
    WHALE_LONG_RATIO: {
        BULLISH: 52,
        BEARISH: 48,
    },

    // RSI
    RSI: {
        OVERBOUGHT: 70,
        OVERSOLD: 30,
    },

    // Price Change & Volatility (%)
    PRICE: {
        STRONG_MOVE: 3,
        VOLATILITY_AMP: 3,
    },

    // Taker Buy/Sell Ratio (%)
    TAKER_RATIO: {
        BULLISH_BIAS: 50,
    }
};
