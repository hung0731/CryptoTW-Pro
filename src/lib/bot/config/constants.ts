
// ============================================
// 幣種中英對照表 - 支援自然語言輸入 (Top 20 常見)
// ============================================
export const COIN_ALIAS_MAP: Record<string, string> = {
    // 比特幣
    '比特幣': 'BTC',
    '大餅': 'BTC',
    'BITCOIN': 'BTC',
    // 以太幣
    '以太幣': 'ETH',
    '以太': 'ETH',
    '二餅': 'ETH',
    'ETHEREUM': 'ETH',
    // SOL
    '索拉納': 'SOL',
    'SOLANA': 'SOL',
    // DOGE
    '狗狗幣': 'DOGE',
    '狗幣': 'DOGE',
    'DOGECOIN': 'DOGE',
    // XRP
    '瑞波幣': 'XRP',
    '瑞波': 'XRP',
    'RIPPLE': 'XRP',
    // 其他 Top 20
    '萊特幣': 'LTC',
    'LITECOIN': 'LTC',
    '幣安幣': 'BNB',
    '波卡': 'DOT',
    'POLKADOT': 'DOT',
    '艾達幣': 'ADA',
    'CARDANO': 'ADA',
    '波場': 'TRX',
    'TRON': 'TRX',
    '雪崩': 'AVAX',
    'AVALANCHE': 'AVAX',
    'POLYGON': 'MATIC',
    '鏈結': 'LINK',
    'CHAINLINK': 'LINK',
    '柴犬幣': 'SHIB',
    // 其他常問
    '原子幣': 'ATOM',
    'COSMOS': 'ATOM',
    'SUI': 'SUI',
    'APT': 'APT',
    'ARB': 'ARB',
    'OP': 'OP',
}

// ============================================
// 黑名單 - 避免誤判為幣種
// ============================================
export const COIN_BLACKLIST = new Set([
    // 法幣
    'USD', 'USDT', 'USDC', 'TWD', 'NTD', 'TV', 'JPY', 'EUR', 'HKD', 'CNY', 'KRW', 'GBP',
    // 單位/縮寫
    'K', 'M', 'B', 'W', 'U',
    // 指令關鍵字
    'HOT', 'TOP', 'RANK', 'PRO', 'HELP', 'FGI',
    // 太短/太常見的詞
    'OK', 'HI', 'NO', 'GO', 'UP', 'ON', 'IN', 'AT', 'TO', 'OF', 'IF', 'OR', 'AN',
])
