/**
 * Centralized Cache Keys and TTLs for CryptoTW Pro
 */

export const CACHE_KEYS = {
    // Market Data
    MARKET_CONTEXT: 'market_context_v4',
    MARKET_DECISION: 'ai_market_decision',
    PRICE_HISTORY: 'btc_price_history',
    DERIVATIVES_SUMMARY: 'derivatives_summary',
    WHALE_SUMMARY: 'whale_summary',
    HOME_ROUTER_DATA: 'home_router_data_v4',

    // Legacy/Migration Keys (to be phased out)
    MARKET_CONTEXT_OLD: 'market_context',
    MARKET_CONTEXT_BRIEF: 'market_context_brief',

    // User Related
    USER_DB_PREFIX: 'user_db:',

    // Cron/Background
    LAST_PRICE_ALERT: 'price_alert:btc:last_price',

    // Resource Locks (Mutex)
    LOCK_MARKET_SUMMARY: 'lock:gemini:market_summary',
    LOCK_MARKET_CONTEXT: 'lock:gemini:market_context',
    LOCK_AI_DECISION: 'lock:gemini:ai_decision',
    LOCK_HOME_ROUTER: 'lock:service:home_router',
} as const

export const CACHE_TTL = {
    INSTANT: 60,         // 1 min
    FAST: 300,           // 5 mins
    NORMAL: 900,         // 15 mins (Default for AI context)
    SLOW: 3600,          // 1 hour
    EXTREME: 86400       // 24 hours
} as const
