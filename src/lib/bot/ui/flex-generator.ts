
import { MarketState } from '@/lib/market-state'

// ============================================
// FLEX MESSAGE 設計規範 - 加密台灣 Pro
// ============================================
// 主色：brand=#1F1AD9 (標題、主按鈕)
// 副色：secondary=#000000 (副按鈕)
// 狀態：up=#00B900, down=#D00000
// 頂部標籤：「加密台灣 Pro」
// 尺寸：bubble=kilo, 標題=lg, 內文=sm
// ============================================

export const THEME = {
    colors: {
        brand: '#1F1AD9',
        secondary: '#000000',
        up: '#00B900',
        down: '#D00000',
        text: '#111111',
        textSub: '#555555',
        textMuted: '#888888',
        textLight: '#aaaaaa',
        separator: '#f0f0f0'
    },
    sizes: {
        bubble: 'kilo',
        title: 'lg',
        body: 'sm',
        sub: 'xs',
        tiny: 'xxs'
    }
} as const

// Universally Shared Footer
export function createSharedFooter() {
    return {
        type: "box" as const,
        layout: "vertical" as const,
        contents: [
            {
                type: "button" as const,
                style: "primary" as const,
                height: "sm" as const,
                action: {
                    type: "uri" as const,
                    label: "追蹤 加密台灣 IG 🏃",
                    uri: "https://www.instagram.com/crypto.tw_"
                },
                color: THEME.colors.brand
            }
        ]
    }
}

// Universally Shared Header Label
export function createProLabel() {
    return {
        type: "text" as const,
        text: "加密台灣 Pro",
        size: "xxs" as const,
        color: THEME.colors.textMuted,
        align: "end" as const,
        gravity: "center" as const
    }
}

// ============================================
// Card Generators
// ============================================

export function createMarketStateCard(state: MarketState | null, isPro: boolean) {
    // 計算更新時間
    const updatedMinutesAgo = state
        ? Math.floor((Date.now() - state.updatedAt) / 60000)
        : 0
    const timeText = updatedMinutesAgo <= 1
        ? '剛剛更新'
        : `更新於 ${updatedMinutesAgo} 分鐘前`

    if (!isPro) {
        // 非 Pro 用戶：鎖定版本
        return {
            type: "flex" as const,
            altText: "交易市場狀態（Pro）",
            contents: {
                type: "bubble" as const,
                size: "kilo" as const,
                body: {
                    type: "box" as const,
                    layout: "vertical" as const,
                    contents: [
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            contents: [
                                { type: "text" as const, text: "交易市場狀態", weight: "bold" as const, size: "lg" as const, color: "#1F1AD9", flex: 1 },
                                createProLabel()
                            ]
                        },
                        { type: "separator" as const, margin: "lg", color: "#f0f0f0" },
                        {
                            type: "box" as const,
                            layout: "vertical" as const,
                            margin: "md",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "box" as const,
                                    layout: "horizontal" as const,
                                    contents: [
                                        { type: "text" as const, text: "資金費率", size: "sm" as const, color: "#555555", flex: 1 },
                                        { type: "text" as const, text: "🔓", size: "sm" as const, color: "#888888", align: "end" as const }
                                    ]
                                },
                                {
                                    type: "box" as const,
                                    layout: "horizontal" as const,
                                    contents: [
                                        { type: "text" as const, text: "多空比", size: "sm" as const, color: "#555555", flex: 1 },
                                        { type: "text" as const, text: "🔓", size: "sm" as const, color: "#888888", align: "end" as const }
                                    ]
                                },
                                {
                                    type: "box" as const,
                                    layout: "horizontal" as const,
                                    contents: [
                                        { type: "text" as const, text: "清算壓力", size: "sm" as const, color: "#555555", flex: 1 },
                                        { type: "text" as const, text: "🔓", size: "sm" as const, color: "#888888", align: "end" as const }
                                    ]
                                }
                            ]
                        },
                        { type: "separator" as const, margin: "md", color: "#f0f0f0" },
                        { type: "text" as const, text: "解鎖查看目前市場偏多還是偏空", size: "xs" as const, color: "#888888", margin: "md", wrap: true }
                    ]
                },
                footer: createSharedFooter()
            }
        }
    }

    // Pro 用戶：完整狀態
    if (!state) {
        return {
            type: "flex" as const,
            altText: "交易市場狀態",
            contents: {
                type: "bubble" as const,
                size: "kilo" as const,
                body: {
                    type: "box" as const,
                    layout: "vertical" as const,
                    contents: [
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            contents: [
                                { type: "text" as const, text: "交易市場狀態", weight: "bold" as const, size: "lg" as const, color: "#1F1AD9", flex: 1 },
                                createProLabel()
                            ]
                        },
                        { type: "separator" as const, margin: "lg", color: "#f0f0f0" },
                        { type: "text" as const, text: "暫時無法取得數據", size: "sm" as const, color: "#888888", margin: "md" }
                    ]
                },
                footer: createSharedFooter()
            }
        }
    }

    // 狀態顏色
    const fundingColor = state.fundingState === '偏多' ? '#00B900' : state.fundingState === '偏空' ? '#D00000' : '#888888'
    const longShortColor = state.longShortState === '多方佔優' ? '#00B900' : state.longShortState === '空方佔優' ? '#D00000' : '#888888'
    const liqColor = state.liquidationState === '高' ? '#D00000' : state.liquidationState === '低' ? '#00B900' : '#888888'

    return {
        type: "flex" as const,
        altText: "交易市場狀態",
        contents: {
            type: "bubble" as const,
            size: "kilo" as const,
            body: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: [
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "交易市場狀態", weight: "bold" as const, size: "lg" as const, color: "#1F1AD9", flex: 1 },
                            createProLabel()
                        ]
                    },
                    { type: "separator" as const, margin: "lg", color: "#f0f0f0" },
                    {
                        type: "box" as const,
                        layout: "vertical" as const,
                        margin: "md",
                        spacing: "sm",
                        contents: [
                            {
                                type: "box" as const,
                                layout: "horizontal" as const,
                                contents: [
                                    { type: "text" as const, text: "資金費率", size: "sm" as const, color: "#555555", flex: 1 },
                                    { type: "text" as const, text: state.fundingState, size: "sm" as const, color: fundingColor, weight: "bold" as const, align: "end" as const, flex: 1 }
                                ]
                            },
                            {
                                type: "box" as const,
                                layout: "horizontal" as const,
                                contents: [
                                    { type: "text" as const, text: "多空比", size: "sm" as const, color: "#555555", flex: 1 },
                                    { type: "text" as const, text: state.longShortState, size: "sm" as const, color: longShortColor, weight: "bold" as const, align: "end" as const, flex: 1 }
                                ]
                            },
                            {
                                type: "box" as const,
                                layout: "horizontal" as const,
                                contents: [
                                    { type: "text" as const, text: "清算壓力", size: "sm" as const, color: "#555555", flex: 1 },
                                    { type: "text" as const, text: state.liquidationState, size: "sm" as const, color: liqColor, weight: "bold" as const, align: "end" as const, flex: 1 }
                                ]
                            }
                        ]
                    },
                    { type: "separator" as const, margin: "lg", color: "#f0f0f0" },
                    { type: "text" as const, text: timeText, size: "xxs" as const, color: "#cccccc", margin: "md", align: "center" as const }
                ]
            },
            footer: createSharedFooter()
        }
    }
}

const ACTION_COLOR_PURPLE = '#8549ba' // Purple for specific actions

export const WELCOME_FLEX_MESSAGE = {
    type: "flex" as const,
    altText: "歡迎加入 加密台灣 Pro",
    contents: {
        type: "bubble" as const,
        size: "kilo" as const,
        body: {
            type: "box" as const,
            layout: "vertical" as const,
            spacing: "md",
            contents: [
                // Header / Intro
                {
                    type: "text" as const,
                    text: "Hi 歡迎使用加密台灣 Pro ,",
                    weight: "bold" as const,
                    size: "lg" as const,
                    color: "#1F1AD9",
                    wrap: true
                },
                {
                    type: "text" as const,
                    text: "歡迎使用以下工具，助你交易更順利！",
                    size: "sm" as const,
                    color: "#555555",
                    wrap: true,
                    margin: "sm" as const
                },
                { type: "separator" as const, color: "#f0f0f0", margin: "lg" },

                // Section 1: Rate Query
                {
                    type: "box" as const,
                    layout: "vertical" as const,
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        { type: "text" as const, text: "💱 查詢可以換多少？", size: "sm" as const, color: "#111111", weight: "bold" as const },
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            spacing: "md",
                            contents: [
                                {
                                    type: "button" as const,
                                    action: { type: "message" as const, label: "3000 台幣", text: "3000 台幣" },
                                    style: "secondary" as const,
                                    color: ACTION_COLOR_PURPLE,
                                    height: "sm" as const
                                },
                                {
                                    type: "button" as const,
                                    action: { type: "message" as const, label: "美金 500", text: "美金 500" },
                                    style: "secondary" as const,
                                    color: ACTION_COLOR_PURPLE,
                                    height: "sm" as const
                                }
                            ]
                        },
                        {
                            type: "button" as const,
                            action: { type: "message" as const, label: "查詢 USDT 匯率？", text: "USDT" },
                            style: "link" as const,
                            color: "#888888",
                            height: "sm" as const,
                            margin: "xs" as const
                        }
                    ]
                },

                // Section 2: Price & Stock
                {
                    type: "box" as const,
                    layout: "vertical" as const,
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        { type: "text" as const, text: "📈 想查幣價 / 美股？", size: "sm" as const, color: "#111111", weight: "bold" as const },
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            spacing: "md",
                            contents: [
                                {
                                    type: "button" as const,
                                    action: { type: "message" as const, label: "BTC", text: "BTC" },
                                    style: "secondary" as const,
                                    height: "sm" as const
                                },
                                {
                                    type: "button" as const,
                                    action: { type: "message" as const, label: "TSLA", text: "TSLA" },
                                    style: "secondary" as const,
                                    height: "sm" as const
                                },
                                {
                                    type: "button" as const,
                                    action: { type: "message" as const, label: "NVDA", text: "NVDA" },
                                    style: "secondary" as const,
                                    height: "sm" as const
                                }
                            ]
                        }
                    ]
                },
                { type: "separator" as const, color: "#f0f0f0", margin: "lg" as const },
                {
                    type: "text" as const,
                    text: "🔥 不如馬上試試看吧！",
                    size: "xs" as const,
                    color: "#aaaaaa",
                    align: "center" as const,
                    margin: "lg"
                }
            ]
        },
        footer: createSharedFooter()
    }
}

export const JOIN_MEMBER_FLEX_MESSAGE = {
    type: "flex" as const,
    altText: "加入 加密台灣 Pro 會員",
    contents: {
        type: "bubble" as const,
        size: "kilo" as const,
        body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
                {
                    type: "box" as const,
                    layout: "horizontal" as const,
                    contents: [
                        {
                            type: "text" as const,
                            text: "🎉 加入會員",
                            weight: "bold" as const,
                            size: "lg" as const,
                            color: "#1F1AD9",
                            flex: 1
                        },
                        createProLabel()
                    ]
                },
                {
                    type: "separator" as const,
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    type: "box" as const,
                    layout: "vertical" as const,
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text" as const,
                            text: "📝 Step 1. 透過推薦碼註冊交易所",
                            size: "sm" as const,
                            color: "#333333"
                        },
                        {
                            type: "text" as const,
                            text: "🔗 Step 2. 綁定交易所 UID",
                            size: "sm" as const,
                            color: "#333333"
                        },
                        {
                            type: "text" as const,
                            text: "✅ Step 3. 等待審核 (24H 內)",
                            size: "sm" as const,
                            color: "#333333"
                        }
                    ]
                },
                {
                    type: "separator" as const,
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    type: "text" as const,
                    text: "✨ 會員福利：即時信號、獨家分析、大客戶社群",
                    size: "xs" as const,
                    color: "#888888",
                    margin: "lg",
                    wrap: true
                }
            ]
        },
        footer: createSharedFooter()
    }
}

export const PRO_BENEFITS_FLEX_MESSAGE = {
    type: "flex" as const,
    altText: "Pro 能幫你做什麼",
    contents: {
        type: "bubble" as const,
        size: "mega" as const,
        body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
                {
                    type: "box" as const,
                    layout: "horizontal" as const,
                    contents: [
                        {
                            type: "text" as const,
                            text: "⭐ Pro 能幫你做什麼",
                            weight: "bold" as const,
                            size: "lg" as const,
                            color: "#1F1AD9",
                            flex: 1
                        },
                        createProLabel()
                    ]
                },
                {
                    type: "separator" as const,
                    margin: "lg",
                    color: "#f0f0f0"
                },
                {
                    type: "box" as const,
                    layout: "vertical" as const,
                    margin: "lg",
                    spacing: "md",
                    contents: [
                        // 1️⃣ 第一時間知道市場在動什麼
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            contents: [
                                { type: "text" as const, text: "1️⃣", size: "lg" as const, flex: 0 },
                                {
                                    type: "box" as const,
                                    layout: "vertical" as const,
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text" as const, text: "第一時間知道「市場在動什麼」", weight: "bold" as const, size: "sm" as const, color: "#333333", wrap: true },
                                        { type: "text" as const, text: "即時市場快訊、重大事件推播，不錯過關鍵波動", size: "xs" as const, color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 2️⃣ 每天快速理解市場狀態
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            contents: [
                                { type: "text" as const, text: "2️⃣", size: "lg" as const, flex: 0 },
                                {
                                    type: "box" as const,
                                    layout: "vertical" as const,
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text" as const, text: "每天快速理解「市場狀態」", weight: "bold" as const, size: "sm" as const, color: "#333333", wrap: true },
                                        { type: "text" as const, text: "AI 市場脈動，整合數據與情緒，判斷現在該觀望還是警戒", size: "xs" as const, color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 3️⃣ 用數據輔助決策
                        {
                            type: "box" as const,
                            layout: "horizontal" as const,
                            contents: [
                                { type: "text" as const, text: "3️⃣", size: "lg" as const, flex: 0 },
                                {
                                    type: "box" as const,
                                    layout: "vertical" as const,
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text" as const, text: "用數據輔助決策", weight: "bold" as const, size: "sm" as const, color: "#333333", wrap: true },
                                        { type: "text" as const, text: "提供「多空比、資金費率、清算圖」等進階數據，不再盲目交易", size: "xs" as const, color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        footer: createSharedFooter()
    }
}

// Help Flex Message - Now mirrors Welcome Message content for consistency
export function createHelpFlexMessage() {
    return WELCOME_FLEX_MESSAGE
}

export const HELP_COMMAND_FLEX_MESSAGE = createHelpFlexMessage()

export function createCurrencyCard(
    amount: number,
    fromCurrency: 'USD' | 'TWD',
    maxPrice: number,
    bitoPrice: number,
    hoyaPrice: number | null
) {
    // 匯率比較邏輯 (保持原樣)
    const bestBuyPrice = Math.min(maxPrice, bitoPrice, hoyaPrice ?? Infinity)
    const bestSellPrice = Math.max(maxPrice, bitoPrice, hoyaPrice ?? -Infinity)

    const usdtAmount = fromCurrency === 'TWD' ? amount / bestBuyPrice : amount
    const twdAmount = fromCurrency === 'USD' ? amount * bestSellPrice : amount

    const headerTitle = fromCurrency === 'TWD' ? '台幣換算' : '美金換算'
    const headerAmount = fromCurrency === 'TWD' ? amount.toLocaleString() : amount.toLocaleString()
    const headerUnit = fromCurrency === 'TWD' ? 'TWD' : 'USD'

    const maxBuyRef = maxPrice.toFixed(2)
    const maxSellRef = maxPrice.toFixed(2)
    const bitoBuyRef = bitoPrice.toFixed(2)
    const bitoSellRef = bitoPrice.toFixed(2)
    const hoyaBuyRef = hoyaPrice ? hoyaPrice.toFixed(2) : '--'
    const hoyaSellRef = hoyaPrice ? hoyaPrice.toFixed(2) : '--'

    return {
        type: "flex" as const,
        altText: `匯率換算：${amount} ${fromCurrency}`,
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
                            { type: "text" as const, text: headerTitle, weight: "bold" as const, size: "lg" as const, color: "#1F1AD9", flex: 1 },
                            createProLabel()
                        ]
                    },
                    ...(headerAmount ? [{
                        type: "box" as const,
                        layout: "baseline" as const,
                        margin: "md",
                        contents: [
                            {
                                type: "text" as const,
                                text: headerAmount,
                                weight: "bold" as const,
                                size: "xxl" as const,
                                color: "#111111",
                                flex: 0
                            },
                            {
                                type: "text" as const,
                                text: ` ${headerUnit}`,
                                weight: "bold" as const,
                                size: "sm" as const,
                                color: "#111111",
                                flex: 0
                            }
                        ]
                    }] : []),
                    ...(usdtAmount > 0 && fromCurrency === 'TWD' ? [{
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "約", size: "sm" as const, color: "#555555" },
                            { type: "text" as const, text: `${usdtAmount.toFixed(2)} USDT`, size: "md" as const, color: "#111111", weight: "bold" as const, margin: "sm" }
                        ],
                        margin: "md"
                    }] : []),
                    ...(twdAmount > 0 && fromCurrency === 'USD' ? [{
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "約", size: "sm" as const, color: "#555555" },
                            { type: "text" as const, text: `${twdAmount.toLocaleString()} TWD`, size: "md" as const, color: "#111111", weight: "bold" as const, margin: "sm" }
                        ],
                        margin: "md"
                    }] : [])
                ]
            },
            body: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: [
                    // 表頭
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "交易所", size: "xs" as const, color: "#888888", flex: 2 },
                            { type: "text" as const, text: "買入", size: "xs" as const, color: "#aaaaaa", align: "end" as const, flex: 1 },
                            { type: "text" as const, text: "賣出", size: "xs" as const, color: "#aaaaaa", align: "end" as const, flex: 1 }
                        ]
                    },
                    { type: "separator" as const, margin: "sm", color: "#f0f0f0" },

                    // MAX
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "MAX", size: "md" as const, color: "#111111", weight: "bold" as const, flex: 2 },
                            { type: "text" as const, text: `${maxBuyRef}`, size: "sm" as const, color: maxBuyRef === bestBuyPrice.toFixed(2) ? "#00B900" : "#bbbbbb", align: "end" as const, weight: maxBuyRef === bestBuyPrice.toFixed(2) ? "bold" as const : "regular" as const, flex: 1 },
                            { type: "text" as const, text: `${maxSellRef}`, size: "sm" as const, color: maxSellRef === bestSellPrice.toFixed(2) ? "#D00000" : "#bbbbbb", align: "end" as const, weight: maxSellRef === bestSellPrice.toFixed(2) ? "bold" as const : "regular" as const, flex: 1 }
                        ],
                        margin: "md"
                    },
                    // BitoPro
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "BitoPro", size: "md" as const, color: "#111111", weight: "bold" as const, flex: 2 },
                            { type: "text" as const, text: `${bitoBuyRef}`, size: "sm" as const, color: bitoBuyRef === bestBuyPrice.toFixed(2) ? "#00B900" : "#bbbbbb", align: "end" as const, weight: bitoBuyRef === bestBuyPrice.toFixed(2) ? "bold" as const : "regular" as const, flex: 1 },
                            { type: "text" as const, text: `${bitoSellRef}`, size: "sm" as const, color: bitoSellRef === bestSellPrice.toFixed(2) ? "#D00000" : "#bbbbbb", align: "end" as const, weight: bitoSellRef === bestSellPrice.toFixed(2) ? "bold" as const : "regular" as const, flex: 1 }
                        ],
                        margin: "md"
                    },
                    // HoyaBit
                    {
                        type: "box" as const,
                        layout: "horizontal" as const,
                        contents: [
                            { type: "text" as const, text: "HoyaBit", size: "md" as const, color: "#111111", weight: "bold" as const, flex: 2 },
                            { type: "text" as const, text: `${hoyaBuyRef}`, size: "sm" as const, color: hoyaBuyRef === bestBuyPrice.toFixed(2) ? "#00B900" : "#bbbbbb", align: "end" as const, weight: hoyaBuyRef === bestBuyPrice.toFixed(2) ? "bold" as const : "regular" as const, flex: 1 },
                            { type: "text" as const, text: `${hoyaSellRef}`, size: "sm" as const, color: hoyaSellRef === bestSellPrice.toFixed(2) ? "#D00000" : "#bbbbbb", align: "end" as const, weight: hoyaSellRef === bestSellPrice.toFixed(2) ? "bold" as const : "regular" as const, flex: 1 }
                        ],
                        margin: "md"
                    }
                ]
            },
            footer: createSharedFooter()
        }
    }
}

// Create Price Flex Message
// 智能價格格式化：根據價格大小決定小數位數
export function formatPrice(price: number): string {
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
export function createPriceCard(data: any) {
    const isUp = parseFloat(data.priceChangePercent) >= 0
    const color = isUp ? THEME.colors.up : THEME.colors.down
    const sign = isUp ? "+" : ""
    const symbol = data.symbol.replace("USDT", "")
    const price = parseFloat(data.lastPrice)
    const high = parseFloat(data.highPrice)
    const low = parseFloat(data.lowPrice)
    const changePercent = Math.abs(parseFloat(data.priceChangePercent))

    // Simplified Price Card - Header Only (Large Price)
    return {
        type: "flex" as const,
        altText: `${symbol} 價格`,
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
                            { type: "text" as const, text: `${symbol} 即時報價`, weight: "bold" as const, size: "lg" as const, color: THEME.colors.brand, flex: 1 },
                            createProLabel()
                        ]
                    },
                    {
                        type: "box" as const,
                        layout: "baseline" as const,
                        margin: "md" as const,
                        contents: [
                            {
                                type: "text" as const,
                                text: `${formatPrice(price)}`,
                                weight: "bold" as const,
                                size: "5xl" as const, // Requested "Large like currency", 5xl is biggest
                                color: "#111111",
                                flex: 0
                            },
                            {
                                type: "text" as const,
                                text: ` ${sign}${changePercent.toFixed(2)}%`,
                                weight: "bold" as const,
                                size: "md" as const,
                                color: color,
                                flex: 0,
                                margin: "md" as const
                            }
                        ]
                    }
                ],
                paddingBottom: "10px" as const
            },
            // Body is empty intentionally, to be filled by merge or left empty
            body: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: []
            },
            footer: createSharedFooter(),
            styles: {
                footer: { separator: true }
            }
        }
    }
}
