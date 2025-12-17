
// Mock functions from route.ts for testing

function normalizeInput(input: string): string {
    return input
        .trim()
        .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        .replace(/\u3000/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/，/g, ',')
        .replace(/。/g, '.')
        .replace(/＄/g, '$')
        .replace(/＃/g, '#')
        .replace(/(\d),(\d)/g, '$1$2')
}

function parseAmount(numStr: string): number {
    let str = numStr.toUpperCase().trim()
    let multiplier = 1

    if (str.includes('萬')) {
        multiplier = 10000
        str = str.replace('萬', '')
    }
    else if (str.includes('千')) {
        multiplier = 1000
        str = str.replace('千', '')
    }
    else if (str.endsWith('K')) {
        multiplier = 1000
        str = str.replace('K', '')
    }
    else if (str.endsWith('M')) {
        multiplier = 1000000
        str = str.replace('M', '')
    }

    const num = parseFloat(str)
    return isNaN(num) ? 0 : num * multiplier
}

function parseCurrencyAmount(input: string): { type: 'USD' | 'TWD', amount: number } | null {
    const normalized = normalizeInput(input)
    const text = normalized.toUpperCase()

    // ===== USD Pattern =====
    // 1. Prefix: "USD 1000", "USDT 500", "U 100"
    let match = text.match(/^(USD[T]?|U)\s+([\d.]+[萬千KM]?)$/i)
    if (match) return { type: 'USD', amount: parseAmount(match[2]) }

    // 2. Suffix with Space: "1000 USD", "500 USDT", "100 U"
    match = text.match(/^([\d.]+[萬千KM]?)\s*(USD[T]?|U)$/i)
    if (match) return { type: 'USD', amount: parseAmount(match[1]) }

    // 3. Suffix No Space: "1000U", "500USDT"
    match = text.match(/^([\d.]+[萬千KM]?)U(SDT?)?$/i)
    if (match) return { type: 'USD', amount: parseAmount(match[1]) }

    // 4. Chinese Suffix
    const usdChineseMatch = normalized.match(/([\d.]+[萬千kKmM]?)\s*(美金|美元|美|刀)/i)
    if (usdChineseMatch) return { type: 'USD', amount: parseAmount(usdChineseMatch[1]) }

    // 5. "換 X 美金"
    const convertMatch = normalized.match(/換\s*([\d.]+[萬千kKmM]?)\s*(美金|美元|美|USD|U)/i)
    if (convertMatch) return { type: 'USD', amount: parseAmount(convertMatch[1]) }

    // ===== TWD Pattern =====
    // 6. Prefix: "TWD 1000"
    match = text.match(/^TWD\s+([\d.]+[萬千KM]?)$/i)
    if (match) return { type: 'TWD', amount: parseAmount(match[1]) }

    // 7. Suffix: "1000 TWD"
    match = text.match(/^([\d.]+[萬千KM]?)\s*TWD$/i)
    if (match) return { type: 'TWD', amount: parseAmount(match[1]) }

    // 8. Chinese Suffix
    const twdChineseMatch = normalized.match(/([\d.]+[萬千kKmM]?)\s*(台幣|新台幣|臺幣)/i)
    if (twdChineseMatch) return { type: 'TWD', amount: parseAmount(twdChineseMatch[1]) }

    // 9. Chinese Prefix
    const twdPrefixMatch = normalized.match(/(台幣|新台幣|臺幣)\s*([\d.]+[萬千kKmM]?)/i)
    if (twdPrefixMatch) return { type: 'TWD', amount: parseAmount(twdPrefixMatch[2]) }

    return null
}

const testCases = [
    "3000 台幣",
    "台幣 3000",
    "3000TWD",
    "NT$3000",
    "NT$ 3,000",
    "3,000",
    "3000u",
    "3000 U",
    "100美金",
    "100 美元",
    "1000 NTD",
    "NTD 1000"
];

console.log("Testing Currency Parser:\n");
testCases.forEach(input => {
    const result = parseCurrencyAmount(input);
    console.log(`Input: "${input}" =>`, result ? `${result.type} ${result.amount}` : "NULL");
});
