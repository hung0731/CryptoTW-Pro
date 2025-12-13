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

async function trackEvent(userId: string | undefined, eventType: string, eventName: string) {
    if (!userId) return
    try {
        const supabase = createAdminClient()
        await supabase.from('analytics_events').insert({
            user_id: userId,
            event_type: eventType,
            event_name: eventName
        })
    } catch (e) {
        console.error('[Analytics] Error:', e)
    }
}

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
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/join`
                    },
                    color: "#000000"
                }
            ]
        }
    }
}

// 加入會員 Flex Message
const JOIN_MEMBER_FLEX_MESSAGE = {
    type: "flex",
    altText: "加入 加密台灣 Pro 會員",
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
                            text: "🎉 加入會員",
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
                    type: "separator",
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "📝 Step 1. 透過推薦碼註冊交易所",
                            size: "sm",
                            color: "#333333"
                        },
                        {
                            type: "text",
                            text: "🔗 Step 2. 綁定交易所 UID",
                            size: "sm",
                            color: "#333333"
                        },
                        {
                            type: "text",
                            text: "✅ Step 3. 等待審核 (24h 內)",
                            size: "sm",
                            color: "#333333"
                        }
                    ]
                },
                {
                    type: "separator",
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    text: "✨ 會員福利：即時信號、獨家分析、大客戶社群",
                    size: "xs",
                    color: "#888888",
                    margin: "lg",
                    wrap: true
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
                        label: "立即加入",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/join`
                    },
                    color: "#1F1AD9"
                },
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "了解更多福利",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/join`
                    },
                    color: "#000000"
                }
            ]
        }
    }
}

// Pro 有什麼 Flex Message (會員福利說明)
const PRO_BENEFITS_FLEX_MESSAGE = {
    type: "flex",
    altText: "Pro 有什麼",
    contents: {
        type: "bubble",
        size: "mega",
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
                            text: "⭐ Pro 有什麼",
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
                    type: "separator",
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "md",
                    contents: [
                        // 即時市場快訊
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "📡", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "即時市場快訊", weight: "bold", size: "sm", color: "#333333" },
                                        { type: "text", text: "大行情、重要事件即時推播通知", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // AI 行情分析
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "🤖", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "AI 市場脈動", weight: "bold", size: "sm", color: "#333333" },
                                        { type: "text", text: "每日 AI 自動彙整市場數據與情緒分析", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 鏈上數據
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "📊", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "專業鏈上數據", weight: "bold", size: "sm", color: "#333333" },
                                        { type: "text", text: "AHR999、泡沫指數、巨鯨追蹤等 20+ 指標", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 財經日曆
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "📅", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "財經日曆", weight: "bold", size: "sm", color: "#333333" },
                                        { type: "text", text: "CPI、FOMC、非農等重大事件預警", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // VIP 社群
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "👥", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "VIP 優先交流群", weight: "bold", size: "sm", color: "#333333" },
                                        { type: "text", text: "與其他 Pro 會員交流策略與資訊", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "text",
                    text: "💡 透過推薦碼註冊交易所，永久免費使用",
                    size: "xxs",
                    color: "#1F1AD9",
                    margin: "lg",
                    align: "center",
                    weight: "bold"
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
                        label: "立即加入 Pro",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/join`
                    },
                    color: "#1F1AD9"
                },
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "查看 VIP 福利",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/join`
                    },
                    color: "#000000"
                }
            ]
        }
    }
}

// 快速查詢 Flex Message
const HELP_COMMAND_FLEX_MESSAGE = {
    type: "flex",
    altText: "快速查詢",
    contents: {
        type: "bubble",
        size: "mega",
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
                            text: "🔍 快速查詢",
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
                    type: "separator",
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        // 幣價查詢
                        {
                            type: "text",
                            text: "💰 幣價查詢",
                            weight: "bold",
                            size: "sm",
                            color: "#1F1AD9"
                        },
                        {
                            type: "text",
                            text: "查詢加密貨幣即時價格與 24h 漲跌幅",
                            size: "xs",
                            color: "#666666",
                            wrap: true
                        },
                        {
                            type: "text",
                            text: "範例：#BTC  @ETH  $SOL  #DOGE",
                            size: "xs",
                            color: "#333333"
                        },
                        {
                            type: "separator",
                            margin: "md",
                            color: "#f0f0f0"
                        },
                        // 市場排行榜
                        {
                            type: "text",
                            text: "📊 市場排行榜",
                            weight: "bold",
                            size: "sm",
                            color: "#1F1AD9"
                        },
                        {
                            type: "text",
                            text: "查看 24h 漲幅/跌幅 Top 5",
                            size: "xs",
                            color: "#666666"
                        },
                        {
                            type: "text",
                            text: "範例：#HOT  @TOP  $RANK",
                            size: "xs",
                            color: "#333333"
                        },
                        {
                            type: "separator",
                            margin: "md",
                            color: "#f0f0f0"
                        },
                        // 匯率查詢
                        {
                            type: "text",
                            text: "💱 匯率查詢 / 換算",
                            weight: "bold",
                            size: "sm",
                            color: "#1F1AD9"
                        },
                        {
                            type: "text",
                            text: "查台幣匯率，或換算金額",
                            size: "xs",
                            color: "#666666"
                        },
                        {
                            type: "text",
                            text: "範例：#TWD (查匯率)  #TWD 1000 (換算)",
                            size: "xs",
                            color: "#333333",
                            wrap: true
                        },
                        {
                            type: "separator",
                            margin: "md",
                            color: "#f0f0f0"
                        },
                        // 恐慌指數
                        {
                            type: "text",
                            text: "😱 恐慌貪婪指數",
                            weight: "bold",
                            size: "sm",
                            color: "#1F1AD9"
                        },
                        {
                            type: "text",
                            text: "市場情緒指標 (0=極度恐慌, 100=極度貪婪)",
                            size: "xs",
                            color: "#666666",
                            wrap: true
                        },
                        {
                            type: "text",
                            text: "範例：恐慌  FGI  情緒",
                            size: "xs",
                            color: "#333333"
                        }
                    ]
                },
                {
                    type: "text",
                    text: "💡 幣價和排行支援前綴：# @ $",
                    size: "xxs",
                    color: "#888888",
                    margin: "lg",
                    align: "center"
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
                        label: "註冊 OKX 交易所",
                        uri: "https://www.okx.com/join/CRYPTOTW"
                    },
                    color: "#1F1AD9"
                },
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "message",
                        label: "加入 Pro 會員",
                        text: "加入會員"
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
        altText: "市場排行榜",
        contents: {
            type: "bubble",
            size: "kilo", // Slightly wider
            header: {
                type: "box",
                layout: "horizontal",
                contents: [
                    {
                        type: "text",
                        text: "市場排行榜",
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
                            { type: "text", text: "漲幅榜", size: "md", weight: "bold", color: "#00B900" }
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
                            { type: "text", text: "跌幅榜", size: "md", weight: "bold", color: "#D00000" }
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
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "uri",
                            label: "註冊 OKX 交易所",
                            uri: "https://www.okx.com/join/CRYPTOTW"
                        },
                        color: "#1F1AD9"
                    },
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "message",
                            label: "加入 加密台灣 Pro",
                            text: "加入會員"
                        },
                        color: "#000000"
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
        return {
            symbol: symbol.toUpperCase() + 'USDT',
            lastPrice: data.last,
            priceChangePercent: ((parseFloat(data.last) - parseFloat(data.open24h)) / parseFloat(data.open24h) * 100).toFixed(2),
            highPrice: data.high24h,
            lowPrice: data.low24h,
            volume: data.vol24h,
            source: 'OKX'
        }
    } catch (e) {
        console.error('[OKX] Fetch Error:', e)
        return null
    }
}

// Fetch 24h ticker from Binance (備援)
async function fetchBinanceTicker(symbol: string) {
    const pair = `${symbol.toUpperCase()}USDT`
    console.log(`[Binance] Fetching ticker for: ${pair}`)

    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!res.ok) {
            console.error(`[Binance] API Error: ${res.status} ${res.statusText}`)
            return null
        }

        const data = await res.json()
        return {
            symbol: data.symbol,
            lastPrice: data.lastPrice,
            priceChangePercent: data.priceChangePercent,
            highPrice: data.highPrice,
            lowPrice: data.lowPrice,
            volume: data.volume,
            source: 'Binance'
        }
    } catch (e) {
        console.error('[Binance] Fetch Error:', e)
        return null
    }
}

// 智能查詢：OKX 優先，Binance 備援
async function fetchCryptoTicker(symbol: string) {
    const okxData = await fetchOkxTicker(symbol)
    if (okxData) {
        console.log(`[Ticker] Using OKX for ${symbol}`)
        return okxData
    }

    console.log(`[Ticker] OKX failed, trying Binance for ${symbol}`)
    const binanceData = await fetchBinanceTicker(symbol)
    if (binanceData) {
        console.log(`[Ticker] Using Binance for ${symbol}`)
        return binanceData
    }

    return null
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
                            { type: "text", text: "單日最高價", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: formatNumber(data.highPrice), size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "單日最低價", size: "sm", color: "#555555", flex: 1 },
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
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "uri",
                            label: "註冊 OKX 交易所",
                            uri: "https://www.okx.com/join/CRYPTOTW"
                        },
                        color: "#1F1AD9"
                    },
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "message",
                            label: "加入 Pro 會員",
                            text: "加入會員"
                        },
                        color: "#000000"
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
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "uri",
                            label: "註冊 OKX 交易所",
                            uri: "https://www.okx.com/join/CRYPTOTW"
                        },
                        color: "#1F1AD9"
                    },
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "message",
                            label: "加入 Pro 會員",
                            text: "加入會員"
                        },
                        color: "#000000"
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
                await trackEvent(event.source.userId, 'follow', 'user_follow')
                await replyMessage(replyToken, [WELCOME_FLEX_MESSAGE])
            }

            // 1.5 Handle UNFOLLOW event
            if (event.type === 'unfollow') {
                await trackEvent(event.source.userId, 'unfollow', 'user_unfollow')
            }

            // 1.6 Handle POSTBACK event
            if (event.type === 'postback') {
                const data = event.postback.data
                await trackEvent(event.source.userId, 'postback', data)
                // Handle specific postbacks here if needed
            }

            // 2. Handle MESSAGE event
            if (event.type === 'message' && event.message.type === 'text') {
                const text = event.message.text.trim().toUpperCase()
                const originalText = event.message.text.trim()

                // Tracking
                await trackEvent(event.source.userId, 'message', originalText)

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

                // B. Ranking Command (#HOT, @HOT, $HOT, etc.)
                if (/^[#@$](HOT|TOP|RANK)$/.test(text)) {
                    const rankingData = await fetchMarketRanking()
                    if (rankingData) {
                        const flexMsg = createRankingCard(rankingData)
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        await replyMessage(replyToken, [{ type: "text", text: "⚠️ 目前無法取得市場數據。" }])
                    }
                    continue
                }

                // B2. Join Member Command (加入會員)
                if (originalText === '加入會員' || originalText === '註冊' || originalText === '會員') {
                    await replyMessage(replyToken, [JOIN_MEMBER_FLEX_MESSAGE])
                    continue
                }

                // B3. Help Command (快速查詢)
                if (originalText === '快速查詢' || originalText === '指令' || originalText === '幫助' || originalText === 'help') {
                    await replyMessage(replyToken, [HELP_COMMAND_FLEX_MESSAGE])
                    continue
                }

                // B4. Pro Benefits Command (Pro 有什麼)
                if (originalText === 'Pro 有什麼' || originalText === 'pro 有什麼' || originalText === 'Pro有什麼' || originalText === '有什麼' || originalText === 'pro') {
                    await replyMessage(replyToken, [PRO_BENEFITS_FLEX_MESSAGE])
                    continue
                }

                // B5. Fear & Greed Index (恐慌指數)
                if (originalText === '恐慌' || originalText === 'FGI' || originalText === 'fgi' || originalText === '情緒' || originalText === '恐慌指數') {
                    try {
                        const fgRes = await fetch('https://api.alternative.me/fng/')
                        const fgData = await fgRes.json()
                        if (fgData.data && fgData.data.length > 0) {
                            const fg = fgData.data[0]
                            const value = parseInt(fg.value)
                            let emoji = '😨'
                            let color = '#D00000'
                            let classification = '極度恐懼'
                            if (value >= 75) { emoji = '🤑'; color = '#00B900'; classification = '極度貪婪' }
                            else if (value >= 55) { emoji = '😏'; color = '#7CB900'; classification = '貪婪' }
                            else if (value >= 45) { emoji = '😐'; color = '#FFB800'; classification = '中立' }
                            else if (value >= 25) { emoji = '😰'; color = '#FF6600'; classification = '恐懼' }

                            const flexMsg = {
                                type: "flex",
                                altText: `恐懼貪婪指數: ${fg.value}`,
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
                                                    { type: "text", text: "恐懼貪婪指數", weight: "bold", size: "lg", color: "#1F1AD9", flex: 1 },
                                                    { type: "text", text: "加密台灣 Pro", size: "xxs", color: "#888888", align: "end", gravity: "center" }
                                                ]
                                            },
                                            { type: "separator", margin: "lg", color: "#f0f0f0" },
                                            {
                                                type: "box",
                                                layout: "horizontal",
                                                margin: "xl",
                                                contents: [
                                                    {
                                                        type: "box",
                                                        layout: "vertical",
                                                        contents: [
                                                            { type: "text", text: emoji, size: "3xl", align: "center" },
                                                            { type: "text", text: classification, size: "sm", color: "#666666", align: "center", margin: "sm" }
                                                        ],
                                                        flex: 1
                                                    },
                                                    {
                                                        type: "text",
                                                        text: fg.value,
                                                        size: "4xl",
                                                        weight: "bold",
                                                        color: color,
                                                        align: "center",
                                                        gravity: "center",
                                                        flex: 1
                                                    }
                                                ]
                                            },
                                            { type: "text", text: "0 = 極度恐慌 | 100 = 極度貪婪", size: "xxs", color: "#888888", margin: "xl", align: "center" }
                                        ]
                                    },
                                    footer: {
                                        type: "box",
                                        layout: "vertical",
                                        spacing: "sm",
                                        contents: [
                                            { type: "button", style: "primary", height: "sm", action: { type: "uri", label: "註冊 OKX 交易所", uri: "https://www.okx.com/join/CRYPTOTW" }, color: "#1F1AD9" },
                                            { type: "button", style: "primary", height: "sm", action: { type: "message", label: "加入 Pro 會員", text: "加入會員" }, color: "#000000" }
                                        ]
                                    }
                                }
                            }
                            await replyMessage(replyToken, [flexMsg])
                        } else {
                            await replyMessage(replyToken, [{ type: "text", text: "⚠️ 無法取得恐慌指數，請稍後再試。" }])
                        }
                    } catch (e) {
                        console.error('FGI Error:', e)
                        await replyMessage(replyToken, [{ type: "text", text: "⚠️ 無法取得恐慌指數，請稍後再試。" }])
                    }
                    continue
                }

                // C. Currency Converter & Rates (#TWD, @TWD, $TWD, etc.)
                const currencyMatch = text.match(/^[#@$](TWD|USD|USDT)(\s+(\d+(\.\d+)?))?$/)

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

                // D. Crypto Price Check (#BTC, @BTC, $BTC)
                const cryptoMatch = text.match(/^[#@$]([A-Z0-9]{2,10})$/)

                if (cryptoMatch) {
                    const symbol = cryptoMatch[1]
                    // Skip if it matched currency codes already handled (though 'continue' handles it)
                    if (['TWD', 'USD', 'USDT', 'HOT', 'TOP', 'RANK'].includes(symbol)) return

                    const ticker = await fetchCryptoTicker(symbol)

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
