
import { COIN_ALIAS_MAP, COIN_BLACKLIST } from '../config/constants'

// ============================================
// 全域輸入正規化 - 所有 parser 共用
// ============================================
export function normalizeInput(input: string): string {
    return input
        .trim()
        // 全形轉半形
        .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        // 全形空格轉半形
        .replace(/\u3000/g, ' ')
        // 移除多餘空白
        .replace(/\s+/g, ' ')
        // 常見標點統一
        .replace(/，/g, ',')
        .replace(/。/g, '.')
        .replace(/＄/g, '$')
        .replace(/＃/g, '#')
        // 移除數字中的逗號 (5,000 -> 5000)
        .replace(/(\d),(\d)/g, '$1$2')
}

// ============================================
// 數字解析器 - 支援 k/萬/千
// ============================================
export function parseAmount(numStr: string): number {
    let str = numStr.toUpperCase().trim()
    let multiplier = 1

    // 萬 = 10000
    if (str.includes('萬')) {
        multiplier = 10000
        str = str.replace('萬', '')
    }
    // 千 = 1000
    else if (str.includes('千')) {
        multiplier = 1000
        str = str.replace('千', '')
    }
    // K = 1000
    else if (str.endsWith('K')) {
        multiplier = 1000
        str = str.replace('K', '')
    }
    // M = 1000000
    else if (str.endsWith('M')) {
        multiplier = 1000000
        str = str.replace('M', '')
    }

    const num = parseFloat(str)
    return isNaN(num) ? 0 : num * multiplier
}

// ============================================
// 幣種解析器（含黑名單護欄）
// ============================================
export function parseCoinSymbol(input: string): string | null {
    const normalized = normalizeInput(input)

    // 移除常見前後綴
    const cleaned = normalized
        .replace(/^[#@$]/, '') // 移除前綴符號
        .replace(/(價格|多少|的價格|現在|怎麼樣|怎樣|如何|幾錢|查|看)$/i, '') // 移除後綴詞
        .trim()

    if (!cleaned) return null

    // 先檢查對照表（原始大小寫）
    if (COIN_ALIAS_MAP[cleaned]) {
        return COIN_ALIAS_MAP[cleaned]
    }

    // 轉大寫後再查
    const upper = cleaned.toUpperCase()
    if (COIN_ALIAS_MAP[upper]) {
        return COIN_ALIAS_MAP[upper]
    }

    // 黑名單檢查
    if (COIN_BLACKLIST.has(upper)) {
        return null
    }

    // 純英數代碼 (2-10字元)
    if (/^[A-Z0-9]{2,10}$/.test(upper)) {
        return upper
    }

    return null
}

// ============================================
// 匯率解析器（含萬/千支援）
// ============================================
export function parseCurrencyAmount(input: string): { type: 'USD' | 'TWD', amount: number } | null {
    const normalized = normalizeInput(input)
    const text = normalized.toUpperCase()

    // ===== USD 系列 =====

    // 模式 1: "USD 1000", "USDT 500", "U 100"
    let match = text.match(/^(USD[T]?|U)\s+([\d.]+[萬千KM]?)$/i)
    if (match) {
        return { type: 'USD', amount: parseAmount(match[2]) }
    }

    // 模式 2: "1000 USD", "500 USDT", "100 U"
    match = text.match(/^([\d.]+[萬千KM]?)\s*(USD[T]?|U)$/i)
    if (match) {
        return { type: 'USD', amount: parseAmount(match[1]) }
    }

    // 模式 3: "1000U", "500USDT" (無空格)
    match = text.match(/^([\d.]+[萬千KM]?)U(SDT?)?$/i)
    if (match) {
        return { type: 'USD', amount: parseAmount(match[1]) }
    }

    // 模式 4: 中文 "1000美金", "5萬美元", "100刀", "1000美"
    const usdChineseMatch = normalized.match(/([\d.]+[萬千kKmM]?)\s*(美金|美元|美|刀)/i)
    if (usdChineseMatch) {
        return { type: 'USD', amount: parseAmount(usdChineseMatch[1]) }
    }

    // 模式 5: "換 X 美金"
    const convertMatch = normalized.match(/換\s*([\d.]+[萬千kKmM]?)\s*(美金|美元|美|USD|U)/i)
    if (convertMatch) {
        return { type: 'USD', amount: parseAmount(convertMatch[1]) }
    }

    // ===== TWD 系列 =====

    // 模式 6: "TWD 1000", "NT$ 1000", "NTD 1000"
    match = text.match(/^(TWD|NT\$?|NTD)\s*([\d.]+[萬千KM]?)$/i)
    if (match) {
        return { type: 'TWD', amount: parseAmount(match[2]) }
    }

    // 模式 7: "1000 TWD", "1000 NTD", "1000 NT"
    match = text.match(/^([\d.]+[萬千KM]?)\s*(TWD|NT\$?|NTD)$/i)
    if (match) {
        return { type: 'TWD', amount: parseAmount(match[1]) }
    }

    // 模式 8: 中文 "10000台幣", "1萬台幣"
    const twdChineseMatch = normalized.match(/([\d.]+[萬千kKmM]?)\s*(台幣|新台幣|臺幣)/i)
    if (twdChineseMatch) {
        return { type: 'TWD', amount: parseAmount(twdChineseMatch[1]) }
    }

    // 模式 9: 中文 "台幣 2000", "台幣1萬" (Prefix)
    const twdPrefixMatch = normalized.match(/(台幣|新台幣|臺幣)\s*([\d.]+[萬千kKmM]?)/i)
    if (twdPrefixMatch) {
        return { type: 'TWD', amount: parseAmount(twdPrefixMatch[2]) }
    }

    return null
}
