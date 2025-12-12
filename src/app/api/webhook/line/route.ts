import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'
import { createAdminClient } from '@/lib/supabase' // Use Service Role for background
import { cookies } from 'next/headers'

// ============================================
// FLEX MESSAGE 設計規範 - 加密台灣 Pro
// ============================================
// 主色：brand=#1F1AD9 (標題、主按鈕)
// 副色：secondary=#000000 (副按鈕)
// 狀態：up=#00B900, down=#D00000
// 頂部標籤：「加密台灣 Pro」
// 尺寸：bubble=kilo, 標題=lg, 內文=sm
// ============================================

const WELCOME_FLEX_MESSAGE = {
    type: "flex",
    altText: "歡迎加入 加密台灣 Pro",
    contents: {
        type: "bubble",
        size: "kilo",
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                        {
                            type: "text",
                            text: "👋 歡迎加入",
                            weight: "bold",
                            size: "lg",
                            color: "#1F1AD9",
                            flex: 1
                        },
                        {
                            type: "text",
                            text: "加密台灣 Pro",
                            size: "xxs",
                            color: "#888888",
                            align: "end",
                            gravity: "center"
                        }
                    ]
                },
                {
                    type: "text",
                    text: "輸入 #BTC 查價格 | #TWD 查匯率 | #HOT 看排行",
                    size: "xs",
                    color: "#888888",
                    margin: "md",
                    wrap: true
                }
            ]
        },
        footer: {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "開啟控制台",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/feed`
                    },
                    color: "#1F1AD9"
                },
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "連結帳戶",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/register`
                    },
                    color: "#000000"
                }
            ]
        }
    }
}

// Updating the object to use PRIMARY for both but different colors to ensure visual requirements


// Fetch Market Top Movers (Gainers & Losers)
async function fetchMarketRanking() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', { next: { revalidate: 60 } }) // Cache 1 min
        if (!res.ok) return null
        const allTickers = await res.json()

        // Filter: USDT pairs only, exclude stablecoins & leveraged
        const ignored = ['USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP', 'EUR', 'GBP']
        const filtered = allTickers.filter((t: any) => {
            if (!t.symbol.endsWith('USDT')) return false
            const base = t.symbol.replace('USDT', '')
            if (ignored.includes(base)) return false
            if (base.endsWith('UP') || base.endsWith('DOWN') || base.endsWith('BEAR') || base.endsWith('BULL')) return false
            return true
        })

        // Sort by Change %
        filtered.sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))

        const topGainers = filtered.slice(0, 5)
        const topLosers = filtered.slice(-5).reverse() // Bottom 5, reversed to show worst first

        return { gainers: topGainers, losers: topLosers }
    } catch (e) {
        console.error('Ranking API Error:', e)
        return null
    }
}

// Create Ranking Flex Message
function createRankingCard(data: any) {
    const { gainers, losers } = data

    const createRow = (item: any, isGainer: boolean) => {
        const symbol = item.symbol.replace('USDT', '')
        const change = parseFloat(item.priceChangePercent).toFixed(1)
        const price = parseFloat(item.lastPrice)
        const displayPrice = price < 1 ? price.toFixed(4) : price < 10 ? price.toFixed(3) : price.toFixed(2)

        return {
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: symbol, size: "sm", color: "#111111", weight: "bold", flex: 3 },
                { type: "text", text: `${displayPrice}`, size: "sm", color: "#555555", align: "end", flex: 3 },
                {
                    type: "text",
                    text: `${isGainer ? '+' : ''}${change}%`,
                    size: "sm",
                    color: isGainer ? "#00B900" : "#D00000",
                    align: "end",
                    weight: "bold",
                    flex: 2
                }
            ],
            margin: "sm"
        }
    }

    return {
        type: "flex",
        altText: "📊 24h 市場異動排行榜",
        contents: {
            type: "bubble",
            size: "kilo", // Slightly wider
            header: {
                type: "box",
                layout: "horizontal",
                contents: [
                    {
                        type: "text",
                        text: "📊 24h 市場異動",
                        weight: "bold",
                        size: "lg",
                        color: "#1F1AD9",
                        flex: 1
                    },
                    {
                        type: "text",
                        text: "加密台灣 Pro",
                        size: "xxs",
                        color: "#888888",
                        align: "end",
                        gravity: "center"
                    }
                ]
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    // Gainers Section
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "🚀 漲幅榜", size: "md", weight: "bold", color: "#00B900" }
                        ],
                        margin: "sm"
                    },
                    { type: "separator", margin: "sm" },
                    ...gainers.map((item: any) => createRow(item, true)),

                    // Losers Section
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "📉 跌幅榜", size: "md", weight: "bold", color: "#D00000" }
                        ],
                        margin: "lg"
                    },
                    { type: "separator", margin: "sm" },
                    ...losers.map((item: any) => createRow(item, false))
                ]
            },
            footer: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "輸入 #BTC 查看單幣詳情",
                        size: "xxs",
                        color: "#888888",
                        align: "center"
                    }
                ]
            }
        }
    }
}

// Helper: Check for custom DB triggers
async function fetchCustomTrigger(text: string) {
    // Note: In a high-traffic bot, we should cache this or use a smart matching strategy.
    // For now, we query for ANY active trigger where the text matches one of the keywords.
    // Since Supabase array contains is tricky for "exact match of element in array", 
    // we fetch active triggers and filter in memory for Phase 1 MVP.
    // Optimisation: We could use .contains('keywords', [text]) if it was exact match, 
    // but users might type part of it. Let's assume exact keyword match for now.

    try {
        // We need a Service Role client here usually because RLS might block anon.
        // But our schema setup allowed anon select.
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('bot_triggers')
            .select('*')
            .eq('is_active', true)

        if (error || !data) return null

        // Find matching trigger (Case insensitive)
        const match = data.find((trigger: any) =>
            trigger.keywords.some((k: string) => k.toLowerCase() === text.toLowerCase())
        )

        return match
    } catch (e) {
        console.error('Trigger Fetch Error:', e)
        return null
    }
}

// Helper to separate number with commas
function formatNumber(num: number | string) {
    return Number(num).toLocaleString('en-US', { maximumFractionDigits: 8 })
}

// Fetch 24h ticker from OKX
async function fetchOkxTicker(symbol: string) {
    const instId = `${symbol.toUpperCase()}-USDT`
    console.log(`[OKX] Fetching ticker for: ${instId}`)

    try {
        const res = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!res.ok) {
            console.error(`[OKX] API Error: ${res.status} ${res.statusText}`)
            return null
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data || json.data.length === 0) {
            console.error(`[OKX] No data for: ${instId}`)
            return null
        }

        const data = json.data[0]
        // 轉換為統一格式
        const ticker = {
            symbol: symbol.toUpperCase() + 'USDT',
            lastPrice: data.last,
            priceChangePercent: ((parseFloat(data.last) - parseFloat(data.open24h)) / parseFloat(data.open24h) * 100).toFixed(2),
            highPrice: data.high24h,
            lowPrice: data.low24h,
            volume: data.vol24h
        }
        console.log(`[OKX] Success: ${ticker.symbol} @ ${ticker.lastPrice}`)
        return ticker
    } catch (e) {
        console.error('[OKX] Fetch Error:', e)
        return null
    }
}

// Create Price Flex Message
// 智能價格格式化：根據價格大小決定小數位數
function formatPrice(price: number): string {
    if (price >= 1000) {
        return Math.round(price).toLocaleString() // 92,294
    } else if (price >= 10) {
        return price.toFixed(2) // 234.56
    } else if (price >= 1) {
        return price.toFixed(2) // 2.45
    } else if (price >= 0.01) {
        return price.toFixed(4) // 0.1234
    } else {
        return price.toFixed(6) // 0.000123
    }
}

// Create Price Flex Message
function createPriceCard(data: any) {
    const isUp = parseFloat(data.priceChangePercent) >= 0
    const color = isUp ? "#00B900" : "#D00000"
    const sign = isUp ? "+" : ""
    const symbol = data.symbol.replace("USDT", "")
    const price = parseFloat(data.lastPrice)

    return {
        type: "flex",
        altText: `${symbol} 價格`,
        contents: {
            type: "bubble",
            size: "kilo",
            header: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            {
                                type: "text",
                                text: `${symbol} 價格`,
                                weight: "bold",
                                size: "lg",
                                color: "#1F1AD9",
                                flex: 1
                            },
                            {
                                type: "text",
                                text: "加密台灣 Pro",
                                size: "xxs",
                                color: "#888888",
                                align: "end",
                                gravity: "center"
                            }
                        ]
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            {
                                type: "text",
                                text: `$${formatPrice(price)}`,
                                weight: "bold",
                                size: "xl",
                                color: "#111111"
                            },
                            {
                                type: "text",
                                text: `${sign}${parseFloat(data.priceChangePercent).toFixed(1)}%`,
                                size: "sm",
                                color: color,
                                align: "end",
                                weight: "bold",
                                gravity: "center"
                            }
                        ],
                        margin: "sm"
                    }
                ],
                paddingBottom: "10px"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "separator",
                        color: "#f0f0f0"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "24h 最高", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: formatNumber(data.highPrice), size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "24h 最低", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: formatNumber(data.lowPrice), size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "sm"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "成交量", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: formatNumber(parseFloat(data.volume).toFixed(2)), size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "sm"
                    }
                ],
                paddingTop: "10px"
            },
            footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        action: {
                            type: "uri",
                            label: "前往 OKX 交易",
                            uri: `https://www.okx.com/trade-spot/${symbol.toLowerCase()}-usdt`
                        },
                        style: "primary",
                        color: "#1F1AD9",
                        height: "sm"
                    },
                    {
                        type: "button",
                        action: {
                            type: "uri",
                            label: "註冊其他交易所",
                            uri: "https://pro.cryptotw.io/exchanges"
                        },
                        style: "primary",
                        color: "#000000",
                        height: "sm"
                    }
                ],
                paddingTop: "10px"
            },
            styles: {
                footer: { separator: true }
            }
        }
    }
}

// Fetch MAX Exchange Ticker (USDT/TWD)
async function fetchMaxTicker() {
    try {
        const res = await fetch('https://max-api.maicoin.com/api/v2/tickers/usdttwd', { next: { revalidate: 30 } }) // Cache 30s
        if (!res.ok) return null
        return await res.json()
    } catch (e) {
        console.error('MAX API Error:', e)
        return null
    }
}

// Fetch BitoPro Orderbook (USDT/TWD)
async function fetchBitoOrderBook() {
    try {
        const res = await fetch('https://api.bitopro.com/v3/order-book/usdt_twd?limit=1', { next: { revalidate: 30 } })
        if (!res.ok) return null
        return await res.json()
    } catch (e) {
        console.error('Bito API Error:', e)
        return null
    }
}

// Fetch Forex Rate (USD/TWD)
async function fetchForexRate() {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { next: { revalidate: 3600 } }) // Cache 1h
        if (!res.ok) return null
        const data = await res.json()
        return data.rates.TWD
    } catch (e) {
        console.error('Forex API Error:', e)
        return null
    }
}

// Create Currency Converter Flex Message
function createCurrencyCard(maxData: any, bitoData: any, forexRate: number, calcResult?: string) {
    // MAX Data
    const maxBuyRef = parseFloat(maxData.sell) // User Buys (Ask)
    const maxSellRef = parseFloat(maxData.buy) // User Sells (Bid)

    // Bito Data
    let bitoBuyRef = 0
    let bitoSellRef = 0
    if (bitoData && bitoData.asks && bitoData.bids) {
        bitoBuyRef = parseFloat(bitoData.asks[0].price) // User Buys (Ask)
        bitoSellRef = parseFloat(bitoData.bids[0].price) // User Sells (Bid)
    }

    const premium = ((maxBuyRef - forexRate) / forexRate) * 100

    // Header Content
    const headerTitle = calcResult ? "換算結果" : "匯率快訊 (USDT/TWD)"

    return {
        type: "flex",
        altText: `TWD Rate: ${maxBuyRef}`,
        contents: {
            type: "bubble",
            size: "kilo",
            header: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            {
                                type: "text",
                                text: headerTitle,
                                weight: "bold",
                                size: "lg",
                                color: "#1F1AD9",
                                flex: 1
                            },
                            {
                                type: "text",
                                text: "加密台灣 Pro",
                                size: "xxs",
                                color: "#888888",
                                align: "end",
                                gravity: "center"
                            }
                        ]
                    },
                    ...(calcResult ? [{
                        type: "text",
                        text: calcResult,
                        weight: "bold",
                        size: "xl",
                        color: "#111111",
                        margin: "sm",
                        wrap: true
                    }] : [])
                ]
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    { type: "separator", color: "#f0f0f0" },

                    // MAX Exchange Row
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "MAX", size: "md", color: "#111111", weight: "bold", flex: 2 },
                            { type: "text", text: "買U", size: "xs", color: "#aaaaaa", align: "end", flex: 1 },
                            { type: "text", text: "賣U", size: "xs", color: "#aaaaaa", align: "end", flex: 1 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "30s 參考價", size: "xs", color: "#aaaaaa", flex: 2 },
                            { type: "text", text: `${maxBuyRef}`, size: "sm", color: "#D00000", align: "end", weight: "bold", flex: 1 }, // User Buys (Ask) - Red (Cost)
                            { type: "text", text: `${maxSellRef}`, size: "sm", color: "#00B900", align: "end", weight: "bold", flex: 1 }  // User Sells (Bid) - Green (Gain)
                        ],
                        margin: "sm"
                    },

                    { type: "separator", margin: "md", color: "#f0f0f0" },

                    // BitoPro Exchange Row
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "BitoPro", size: "md", color: "#111111", weight: "bold", flex: 2 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "即時掛單", size: "xs", color: "#aaaaaa", flex: 2 },
                            { type: "text", text: bitoBuyRef ? `${bitoBuyRef}` : '--', size: "sm", color: "#D00000", align: "end", weight: "bold", flex: 1 },
                            { type: "text", text: bitoSellRef ? `${bitoSellRef}` : '--', size: "sm", color: "#00B900", align: "end", weight: "bold", flex: 1 }
                        ],
                        margin: "sm"
                    },

                    { type: "separator", margin: "md", color: "#f0f0f0" },

                    // Bank Rate Row
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "銀行美金", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: `${forexRate} TWD`, size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "MAX 溢價", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: `+${premium.toFixed(2)}%`, size: "sm", color: "#ff8800", weight: "bold", align: "end", flex: 2 }
                        ],
                        margin: "sm"
                    }
                ],
                paddingTop: "10px"
            },
            footer: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "button",
                        action: { type: "uri", label: "前往 MAX 交易", uri: "https://max.maicoin.com/markets/usdttwd" },
                        style: "primary",
                        color: "#1F1AD9",
                        height: "sm"
                    },
                    {
                        type: "button",
                        action: { type: "uri", label: "前往 BitoPro 交易", uri: "https://www.bitopro.com/ns/trading/usdt_twd" },
                        style: "primary",
                        color: "#000000",
                        height: "sm",
                        margin: "sm"
                    }
                ]
            }
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-line-signature')

        if (!verifyLineSignature(body, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const data = JSON.parse(body)
        const events = data.events || []

        for (const event of events) {
            const replyToken = event.replyToken

            // 1. Handle FOLLOW event
            if (event.type === 'follow') {
                await replyMessage(replyToken, [WELCOME_FLEX_MESSAGE])
            }

            // 2. Handle MESSAGE event
            if (event.type === 'message' && event.message.type === 'text') {
                const text = event.message.text.trim().toUpperCase() // Use raw text for matching? Actually we want case insensitive usually.
                // But for #commands we normalized to uppercase.
                // For natural language keywords (e.g. "換算"), users might type any case.
                const originalText = event.message.text.trim()

                // A. Check Custom Triggers (Highest Priority if not starting with #?)
                // Actually, let's keep #commands hardcoded as they are specialized logic.
                // Check custom triggers if it doesn't look like a #command OR if we want to allow overriding.
                // Let's check custom triggers first for exact matches on keywords?
                const customTrigger = await fetchCustomTrigger(originalText)
                if (customTrigger) {
                    let messages = []
                    if (customTrigger.reply_type === 'text') {
                        messages = [{ type: 'text', text: customTrigger.reply_content.text }]
                    } else {
                        messages = [customTrigger.reply_content] // Flex
                    }
                    await replyMessage(replyToken, messages)
                    continue
                }

                // B. Ranking Command (#HOT, #TOP, #RANK)
                if (['#HOT', '#TOP', '#RANK'].includes(text)) {
                    const rankingData = await fetchMarketRanking()
                    if (rankingData) {
                        const flexMsg = createRankingCard(rankingData)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        await replyMessage(replyToken, [{ type: "text", text: "⚠️ 目前無法取得市場數據。" }])
                    }
                    continue
                }

                // C. Currency Converter & Rates (#TWD, #USD, #USDT)
                // Patterns: #TWD, #TWD 1000, #USD, #USD 100, #USDT, #USDT 100
                const currencyMatch = text.match(/^#(TWD|USD|USDT)(\s+(\d+(\.\d+)?))?$/)

                if (currencyMatch) {
                    const type = currencyMatch[1] // TWD, USD, USDT
                    const amountStr = currencyMatch[3] // 1000, 100 or undefined
                    const amount = amountStr ? parseFloat(amountStr) : null

                    const [maxData, bitoData, forexRate] = await Promise.all([
                        fetchMaxTicker(),
                        fetchBitoOrderBook(),
                        fetchForexRate()
                    ])

                    if (maxData && forexRate) {
                        let calcResult = undefined

                        // For Calculation, primarily use MAX data as reference (Top Liquidity)
                        // Or we can mention "Avg" but let's stick to MAX for simplicity in the result text string
                        const maxBuyRef = parseFloat(maxData.sell)
                        const maxSellRef = parseFloat(maxData.buy)

                        if (amount) {
                            // Calculator Logic
                            if (type === 'TWD') {
                                // TWD -> USDT (Buy U at Ask Price)
                                const result = (amount / maxBuyRef).toFixed(2)
                                calcResult = `${amount.toLocaleString()} TWD\n≈ ${parseFloat(result).toLocaleString()} USDT`
                            } else {
                                // USD/USDT -> TWD (Sell U at Bid Price)
                                const result = (amount * maxSellRef).toFixed(0)
                                calcResult = `${amount.toLocaleString()} USDT\n≈ ${parseInt(result).toLocaleString()} TWD`
                            }
                        }

                        const flexMsg = createCurrencyCard(maxData, bitoData, forexRate, calcResult)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        await replyMessage(replyToken, [{ type: "text", text: "⚠️ 目前無法取得匯率資訊，請稍後再試。" }])
                    }
                    continue // Skip other checks
                }

                // D. Crypto Price Check (#BTC)
                const cryptoMatch = text.match(/^#([A-Z0-9]{2,10})$/)

                if (cryptoMatch) {
                    const symbol = cryptoMatch[1]
                    // Skip if it matched currency codes already handled (though 'continue' handles it)
                    if (['TWD', 'USD', 'USDT', 'HOT', 'TOP', 'RANK'].includes(symbol)) return

                    const ticker = await fetchOkxTicker(symbol)

                    if (ticker) {
                        const flexMsg = createPriceCard(ticker)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        await replyMessage(replyToken, [{
                            type: "text",
                            text: `⚠️ 找不到代幣 "${symbol}" 或 OKX 尚未上架。`
                        }])
                    }
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('Webhook Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
