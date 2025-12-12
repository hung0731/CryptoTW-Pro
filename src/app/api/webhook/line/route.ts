import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'

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
                const text = event.message.text.trim()

                // Regex for #symbol (e.g., #BTC, #eth, #DOGE)
                const match = text.match(/^#([a-zA-Z0-9]{2,10})$/)

                if (match) {
                    const symbol = match[1]
                    const ticker = await fetchBinanceTicker(symbol)

                    if (ticker) {
                        const flexMsg = createPriceCard(ticker)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        // Optional: Reply if coin not found
                        await replyMessage(replyToken, [{
                            type: "text",
                            text: `⚠️ 找不到代幣 "${symbol}" 或 Binance 尚未上架。請確認拼寫是否正確 (預設對應 USDT 交易對)。`
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
