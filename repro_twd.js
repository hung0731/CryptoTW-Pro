
function normalizeInput(input) {
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

function parseAmount(numStr) {
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

function parseCurrencyAmount(input) {
    const normalized = normalizeInput(input)
    const text = normalized.toUpperCase()

    console.log(`Normalized: "${normalized}", Text: "${text}"`)

    // 模式 7: "1000 TWD", "1000 NTD", "1000 NT"
    // Note: JS Regex might behave slightly differently if copied directly, but let's try to match the TS one.
    // original: /^([\d.]+[萬千KM]?)\s*(TWD|NT\$?|NTD)$/i
    let match = text.match(/^([\d.]+[萬千KM]?)\s*(TWD|NT\$?|NTD)$/i)
    if (match) {
        console.log("Matched Pattern 7")
        return { type: 'TWD', amount: parseAmount(match[1]) }
    }

    return null
}

const input = "7000twd";
const result = parseCurrencyAmount(input);
console.log("Result:", result);
