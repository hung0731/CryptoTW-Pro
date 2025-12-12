import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'
import { createAdminClient } from '@/lib/supabase' // Use Service Role for background
import { cookies } from 'next/headers'

const WELCOME_FLEX_MESSAGE = {
    type: "flex",
    altText: "CryptoTW 系統存取",
    contents: {
        type: "bubble",
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "CryptoTW 系統",
                    weight: "bold",
                    color: "#000000",
                    size: "xl"
                },
                {
                    type: "text",
                    text: "專業交易情報",
                    weight: "regular",
                    color: "#000000",
                    size: "xs",
                    margin: "sm"
                },
                {
                    type: "separator",
                    margin: "lg"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "服務項目：",
                            size: "xs",
                            color: "#aaaaaa",
                            margin: "sm"
                        },
                        {
                            type: "text",
                            text: "• 市場信號與分析",
                            size: "sm",
                            color: "#333333"
                        },
                        {
                            type: "text",
                            text: "• 交易所帳戶串接",
                            size: "sm",
                            color: "#333333"
                        },
                        {
                            type: "text",
                            text: "• 大客戶計畫與機構服務",
                            size: "sm",
                            color: "#333333"
                        }
                    ]
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
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
                    color: "#000000"
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
                    color: "#211FFF" // Using secondary style but overriding text color if supported, or background? 
                    // Wait, 'style: secondary' usually has fixed text colors in LINE. 
                    // Better validation: 'secondary' is usually grey/light button with dark text. 
                    // If we want specific colors, we often use PRIMARY style with custom color property.
                    // User asked for #211FFF button. Let's use primary with that color to be safe.
                }
            ]
        },
        styles: {
            footer: {
                separator: true
            }
        }
    }
    // Re-correcting the button strategy below.
}

// Updating the object to use PRIMARY for both but different colors to ensure visual requirements


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

// Fetch 24h ticker from Binance
async function fetchBinanceTicker(symbol: string) {
    try {
        const pair = symbol.toUpperCase().endsWith('USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`)
        if (!res.ok) return null
        return await res.json()
    } catch (e) {
        console.error('Binance API Error:', e)
        return null
    }
}

// Create Price Flex Message
// Create Price Flex Message
// Create Price Flex Message
function createPriceCard(data: any) {
    const isUp = parseFloat(data.priceChangePercent) >= 0
    const color = isUp ? "#00B900" : "#D00000" // Green : Red
    const sign = isUp ? "+" : ""

    return {
        type: "flex",
        altText: `${data.symbol} Price: ${data.lastPrice}`,
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
                                text: data.symbol.replace("USDT", ""),
                                weight: "bold",
                                size: "xl",
                                color: "#111111",
                                flex: 1
                            },
                            {
                                type: "text",
                                text: `$${parseFloat(data.lastPrice).toLocaleString()}`,
                                weight: "bold",
                                size: "xl",
                                color: "#111111",
                                align: "end",
                                flex: 2
                            }
                        ]
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            {
                                type: "text",
                                text: "Binance Spot",
                                size: "xs",
                                color: "#aaaaaa"
                            },
                            {
                                type: "text",
                                text: `${sign}${parseFloat(data.priceChangePercent).toFixed(2)}%`,
                                size: "sm",
                                color: color,
                                align: "end",
                                weight: "bold"
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
                            { type: "text", text: "24h High", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: formatNumber(data.highPrice), size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "24h Low", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: formatNumber(data.lowPrice), size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "sm"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "Vol (BTC)", size: "sm", color: "#555555", flex: 1 },
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
                contents: [
                    {
                        type: "button",
                        action: {
                            type: "uri",
                            label: "前往 Binance 交易",
                            uri: `https://www.binance.com/en/trade/${data.symbol}`
                        },
                        style: "primary",
                        color: "#F0B90B", // Binance Yellow
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
                        type: "text",
                        text: headerTitle,
                        weight: "bold",
                        size: "lg",
                        color: "#111111"
                    },
                    ...(calcResult ? [{
                        type: "text",
                        text: calcResult,
                        weight: "bold",
                        size: "xl",
                        color: "#00B900",
                        wrap: true,
                        margin: "md"
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
                        style: "secondary",
                        height: "sm"
                    },
                    {
                        type: "button",
                        action: { type: "uri", label: "前往 BitoPro 交易", uri: "https://www.bitopro.com/ns/trading/usdt_twd" },
                        style: "secondary",
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

                // B. Currency Converter & Rates (#TWD, #USD, #USDT)
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
                                calcResult = `${amount} TWD ≈ ${result} USDT`
                            } else {
                                // USD/USDT -> TWD (Sell U at Bid Price)
                                const result = (amount * maxSellRef).toFixed(0)
                                calcResult = `${amount} USDT ≈ ${result} TWD`
                            }
                        }

                        const flexMsg = createCurrencyCard(maxData, bitoData, forexRate, calcResult)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        await replyMessage(replyToken, [{ type: "text", text: "⚠️ 目前無法取得匯率資訊，請稍後再試。" }])
                    }
                    continue // Skip other checks
                }

                // C. Crypto Price Check (#BTC)
                const cryptoMatch = text.match(/^#([A-Z0-9]{2,10})$/)

                if (cryptoMatch) {
                    const symbol = cryptoMatch[1]
                    // Skip if it matched currency codes already handled (though 'continue' handles it)
                    if (['TWD', 'USD', 'USDT'].includes(symbol)) return

                    const ticker = await fetchBinanceTicker(symbol)

                    if (ticker) {
                        const flexMsg = createPriceCard(ticker)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        // Only reply error if it looks like a ticker command and wasn't handled
                        // For better UX, maybe SILENT fail if unknown, or generic help?
                        // User asked for error message previously.
                        await replyMessage(replyToken, [{
                            type: "text",
                            text: `⚠️ 找不到代幣 "${symbol}" 或 Binance 尚未上架。`
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
