
import yahooFinance from 'yahoo-finance2'

export async function fetchStockTicker(symbol: string) {
    try {
        // @ts-ignore
        const yf = new yahooFinance()
        const quote = await yf.quote(symbol) as any

        if (!quote) return null

        // Check if it's a valid stock-like instrument (Equity, ETF, Index)
        // Some crypto might leak in here e.g. BTC-USD, but we handle crypto separately.
        // We defer to this only if crypto lookup failed.

        return {
            symbol: quote.symbol,
            shortName: quote.shortName || quote.symbol,
            regularMarketPrice: quote.regularMarketPrice,
            regularMarketChangePercent: quote.regularMarketChangePercent,
            regularMarketPreviousClose: quote.regularMarketPreviousClose,
            marketState: quote.marketState, // PRE, REGULAR, POST, CLOSED
            preMarketPrice: quote.preMarketPrice,
            preMarketChangePercent: quote.preMarketChangePercent,
            postMarketPrice: quote.postMarketPrice,
            postMarketChangePercent: quote.postMarketChangePercent,
            currency: quote.currency
        }
    } catch (e) {
        // console.error('Yahoo Finance Error:', e)
        // Silent fail is fine, means symbol not found
        return null
    }
}

export function createStockCard(data: any) {
    const isUp = (data.regularMarketChangePercent || 0) >= 0
    const color = isUp ? "#00B900" : "#D00000"
    const sign = isUp ? "+" : ""

    // Determine current display price based on market state if desired, 
    // but usually users want "Regular Market" as main, and "Pre/Post" as secondary.
    // Let's stick to Regular as Big Number.

    const price = data.regularMarketPrice
    const changePercent = data.regularMarketChangePercent || 0

    // Extended Hours Logic
    let extendedText = ""
    if (data.marketState === 'PRE' && data.preMarketPrice) {
        const preChange = data.preMarketChangePercent || 0
        const preSign = preChange >= 0 ? "+" : ""
        extendedText = `盤前: ${data.preMarketPrice} (${preSign}${preChange.toFixed(2)}%)`
    } else if ((data.marketState === 'POST' || data.marketState === 'CLOSED') && data.postMarketPrice) {
        const postChange = data.postMarketChangePercent || 0
        const postSign = postChange >= 0 ? "+" : ""
        extendedText = `盤後: ${data.postMarketPrice} (${postSign}${postChange.toFixed(2)}%)`
    }

    return {
        type: "flex" as const,
        altText: `${data.symbol} 股價`,
        contents: {
            type: "bubble" as const,
            size: "kilo" as const,
            header: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: [
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            {
                                type: "text" as const,
                                text: data.symbol,
                                weight: "bold" as const,
                                size: "lg" as const,
                                color: "#1F1AD9",
                                flex: 1
                            },
                            {
                                type: "text" as const,
                                text: "加密台灣 Pro",
                                size: "xxs" as const,
                                color: "#888888",
                                align: "end" as const,
                                gravity: "center" as const
                            }
                        ]
                    },
                    {
                        type: "text" as const,
                        text: data.shortName,
                        size: "xs" as const,
                        color: "#666666",
                        margin: "none"
                    },
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            {
                                type: "text" as const,
                                text: `${price?.toFixed(2)}`,
                                weight: "bold" as const,
                                size: "xl" as const,
                                color: "#111111"
                            },
                            {
                                type: "text" as const,
                                text: `${sign}${changePercent.toFixed(2)}%`,
                                size: "sm" as const,
                                color: color,
                                align: "end" as const,
                                weight: "bold" as const,
                                gravity: "center" as const
                            }
                        ],
                        margin: "md"
                    },
                    // Extended Hours
                    ...(extendedText ? [{
                        type: "text" as const,
                        text: extendedText,
                        size: "xs" as const,
                        color: "#888888",
                        margin: "sm"
                    } as any] : [])
                ],
                paddingBottom: "10px"
            },
            body: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: [
                    { type: "separator" as const, color: "#f0f0f0" },
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "昨收", size: "sm" as const, color: "#555555", flex: 1 },
                            { type: "text" as const, text: `${data.regularMarketPreviousClose}`, size: "sm" as const, color: "#111111", align: "end" as const, flex: 2 }
                        ],
                        margin: "md"
                    },
                    {
                        type: "text" as const,
                        text: `Market State: ${data.marketState}`,
                        size: "xxs" as const,
                        color: "#cccccc",
                        margin: "md",
                        align: "end" as const
                    }
                ],
                paddingTop: "10px"
            },
            footer: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: [
                    {
                        type: "button" as const,
                        style: "primary" as const,
                        height: "sm",
                        action: {
                            type: "uri" as const,
                            label: "追蹤 加密台灣 IG 🏃",
                            uri: "https://www.instagram.com/crypto.tw_"
                        },
                        color: "#1F1AD9"
                    }
                ]
            }
        }
    }
}
