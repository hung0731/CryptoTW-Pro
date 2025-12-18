/**
 * 格式化台灣幣圈相關文案
 * 主要處理：中英文/數字間距、標點符號標準化
 */
export function formatTaiwaneseText(text: string | null | undefined): string {
    if (!text) return ''

    let formatted = text

    // 1. 中英文/數字之間加空格
    // 中文與英文/數字之間
    formatted = formatted.replace(/([\u4e00-\u9fa5])([A-Za-z0-9])/g, '$1 $2')
    // 英文/數字與中文之間
    formatted = formatted.replace(/([A-Za-z0-9])([\u4e00-\u9fa5])/g, '$1 $2')

    // 2. 處理特殊單位不加空格 (%, °, K, M, B 若緊接數字通常不加，但在某些規範下要加)
    // 用戶規則：％與°不用加
    formatted = formatted.replace(/(\d)\s+([%°％])/g, '$1$2')
    formatted = formatted.replace(/([%°％])\s+([\u4e00-\u9fa5])/g, '$1 $2') // 單位後接中文要空格

    // 3. 修正常見標點誤用 (可選，根據需求)
    // 將連續的句號轉為單一
    formatted = formatted.replace(/。{2,}/g, '。')

    return formatted.trim()
}

/**
 * 遞迴格式化物件中的所有字串欄位
 */
export function formatObjectStrings<T>(obj: T): T {
    if (typeof obj === 'string') {
        return formatTaiwaneseText(obj) as unknown as T
    }

    if (Array.isArray(obj)) {
        return obj.map(item => formatObjectStrings(item)) as unknown as T
    }

    if (obj !== null && typeof obj === 'object') {
        const newObj: any = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = formatObjectStrings((obj as any)[key])
            }
        }
        return newObj
    }

    return obj
}
