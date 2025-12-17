import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'
import { getHoyabitPrices } from '@/lib/hoyabit'
import { createAdminClient } from '@/lib/supabase' // Use Service Role for background
import { cookies } from 'next/headers'
import { getMarketState, type MarketState } from '@/lib/market-state'

// 低頻引導緩存：記錄用戶最後一次收到提示的時間
const fallbackHintCache = new Map<string, number>()

// ============================================
// FLEX MESSAGE 設計規範 - 加密台灣 Pro
// ============================================
// 主色：brand=#1F1AD9 (標題、主按鈕)
// 副色：secondary=#000000 (副按鈕)
// 狀態：up=#00B900, down=#D00000
// 頂部標籤：「加密台灣 Pro」
// 尺寸：bubble=kilo, 標題=lg, 內文=sm
// ============================================

// ============================================
// 幣種中英對照表 - 支援自然語言輸入 (Top 20 常見)
// ============================================
const COIN_ALIAS_MAP: Record<string, string> = {
    // 比特幣
    '比特幣': 'BTC',
    '大餅': 'BTC',
    'BITCOIN': 'BTC',
    // 以太幣
    '以太幣': 'ETH',
    '以太': 'ETH',
    '二餅': 'ETH',
    'ETHEREUM': 'ETH',
    // SOL
    '索拉納': 'SOL',
    'SOLANA': 'SOL',
    // DOGE
    '狗狗幣': 'DOGE',
    '狗幣': 'DOGE',
    'DOGECOIN': 'DOGE',
    // XRP
    '瑞波幣': 'XRP',
    '瑞波': 'XRP',
    'RIPPLE': 'XRP',
    // 其他 Top 20
    '萊特幣': 'LTC',
    'LITECOIN': 'LTC',
    '幣安幣': 'BNB',
    '波卡': 'DOT',
    'POLKADOT': 'DOT',
    '艾達幣': 'ADA',
    'CARDANO': 'ADA',
    '波場': 'TRX',
    'TRON': 'TRX',
    '雪崩': 'AVAX',
    'AVALANCHE': 'AVAX',
    'POLYGON': 'MATIC',
    '鏈結': 'LINK',
    'CHAINLINK': 'LINK',
    '柴犬幣': 'SHIB',
    // 其他常問
    '原子幣': 'ATOM',
    'COSMOS': 'ATOM',
    'SUI': 'SUI',
    'APT': 'APT',
    'ARB': 'ARB',
    'OP': 'OP',
}

// ============================================
// 黑名單 - 避免誤判為幣種
// ============================================
const COIN_BLACKLIST = new Set([
    // 法幣
    'USD', 'USDT', 'USDC', 'TWD', 'NTD', 'TW', 'JPY', 'EUR', 'HKD', 'CNY', 'KRW', 'GBP',
    // 單位/縮寫
    'K', 'M', 'B', 'W', 'U',
    // 指令關鍵字
    'HOT', 'TOP', 'RANK', 'PRO', 'HELP', 'FGI',
    // 太短/太常見的詞
    'OK', 'HI', 'NO', 'GO', 'UP', 'ON', 'IN', 'AT', 'TO', 'OF', 'IF', 'OR', 'AN',
])

// ============================================
// 全域輸入正規化 - 所有 parser 共用
// ============================================
function normalizeInput(input: string): string {
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
function parseAmount(numStr: string): number {
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
function parseCoinSymbol(input: string): string | null {
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
function parseCurrencyAmount(input: string): { type: 'USD' | 'TWD', amount: number } | null {
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

    // 模式 6: "TWD 1000"
    match = text.match(/^TWD\s+([\d.]+[萬千KM]?)$/i)
    if (match) {
        return { type: 'TWD', amount: parseAmount(match[1]) }
    }

    // 模式 7: "1000 TWD"
    match = text.match(/^([\d.]+[萬千KM]?)\s*TWD$/i)
    if (match) {
        return { type: 'TWD', amount: parseAmount(match[1]) }
    }

    // 模式 8: 中文 "10000台幣", "1萬台幣"
    const twdChineseMatch = normalized.match(/([\d.]+[萬千kKmM]?)\s*(台幣|新台幣|臺幣)/i)
    if (twdChineseMatch) {
        return { type: 'TWD', amount: parseAmount(twdChineseMatch[1]) }
    }

    return null
}


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

// ============================================
// Pro 用戶判斷
// ============================================
async function checkIsProUser(lineUserId: string): Promise<boolean> {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('users')
            .select('membership_status')
            .eq('line_user_id', lineUserId)
            .single()

        if (error || !data) return false

        return data.membership_status === 'pro' || data.membership_status === 'lifetime'
    } catch (e) {
        console.error('[Pro Check] Error:', e)
        return false
    }
}

// ============================================
// 市場狀態卡片（Pro 專屬）
// ============================================
function createMarketStateCard(state: MarketState | null, isPro: boolean) {
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
            type: "flex",
            altText: "交易市場狀態（Pro）",
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
                                { type: "text", text: "交易市場狀態", weight: "bold", size: "lg", color: "#1F1AD9", flex: 1 },
                                { type: "text", text: "加密台灣 Pro", size: "xxs", color: "#888888", align: "end", gravity: "center" }
                            ]
                        },
                        { type: "separator", margin: "lg", color: "#f0f0f0" },
                        {
                            type: "box",
                            layout: "vertical",
                            margin: "md",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        { type: "text", text: "資金費率", size: "sm", color: "#555555", flex: 1 },
                                        { type: "text", text: "🔓", size: "sm", color: "#888888", align: "end" }
                                    ]
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        { type: "text", text: "多空比", size: "sm", color: "#555555", flex: 1 },
                                        { type: "text", text: "🔓", size: "sm", color: "#888888", align: "end" }
                                    ]
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        { type: "text", text: "清算壓力", size: "sm", color: "#555555", flex: 1 },
                                        { type: "text", text: "🔓", size: "sm", color: "#888888", align: "end" }
                                    ]
                                }
                            ]
                        },
                        { type: "separator", margin: "md", color: "#f0f0f0" },
                        { type: "text", text: "解鎖查看目前市場偏多還是偏空", size: "xs", color: "#888888", margin: "md", wrap: true }
                    ]
                },
                footer: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            type: "button",
                            style: "primary",
                            height: "sm",
                            action: {
                                type: "uri",
                                label: "追蹤加密台灣 IG",
                                uri: "https://www.instagram.com/crypto.tw_"
                            },
                            color: "#1F1AD9"
                        }
                    ]
                }
            }
        }
    }

    // Pro 用戶：完整狀態
    if (!state) {
        return {
            type: "flex",
            altText: "交易市場狀態",
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
                                { type: "text", text: "交易市場狀態", weight: "bold", size: "lg", color: "#1F1AD9", flex: 1 },
                                { type: "text", text: "加密台灣 Pro", size: "xxs", color: "#888888", align: "end", gravity: "center" }
                            ]
                        },
                        { type: "separator", margin: "lg", color: "#f0f0f0" },
                        { type: "text", text: "暫時無法取得數據", size: "sm", color: "#888888", margin: "md" }
                    ]
                }
            }
        }
    }

    // 狀態顏色
    const fundingColor = state.fundingState === '偏多' ? '#00B900' : state.fundingState === '偏空' ? '#D00000' : '#888888'
    const longShortColor = state.longShortState === '多方佔優' ? '#00B900' : state.longShortState === '空方佔優' ? '#D00000' : '#888888'
    const liqColor = state.liquidationState === '高' ? '#D00000' : state.liquidationState === '低' ? '#00B900' : '#888888'

    return {
        type: "flex",
        altText: "交易市場狀態",
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
                            { type: "text", text: "交易市場狀態", weight: "bold", size: "lg", color: "#1F1AD9", flex: 1 },
                            { type: "text", text: "加密台灣 Pro", size: "xxs", color: "#888888", align: "end", gravity: "center" }
                        ]
                    },
                    { type: "separator", margin: "lg", color: "#f0f0f0" },
                    {
                        type: "box",
                        layout: "vertical",
                        margin: "md",
                        spacing: "sm",
                        contents: [
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    { type: "text", text: "資金費率", size: "sm", color: "#555555", flex: 1 },
                                    { type: "text", text: state.fundingState, size: "sm", color: fundingColor, weight: "bold", align: "end", flex: 1 }
                                ]
                            },
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    { type: "text", text: "多空比", size: "sm", color: "#555555", flex: 1 },
                                    { type: "text", text: state.longShortState, size: "sm", color: longShortColor, weight: "bold", align: "end", flex: 1 }
                                ]
                            },
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    { type: "text", text: "清算壓力", size: "sm", color: "#555555", flex: 1 },
                                    { type: "text", text: state.liquidationState, size: "sm", color: liqColor, weight: "bold", align: "end", flex: 1 }
                                ]
                            }
                        ]
                    },
                    { type: "separator", margin: "md", color: "#f0f0f0" },
                    { type: "text", text: timeText, size: "xxs", color: "#888888", margin: "sm", align: "end" }
                ]
            }
        }
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
            layout: "vertical",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "追蹤加密台灣 IG",
                        uri: "https://www.instagram.com/crypto.tw_"
                    },
                    color: "#1F1AD9"
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
                            text: "✅ Step 3. 等待審核 (24H 內)",
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
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "追蹤加密台灣 IG",
                        uri: "https://www.instagram.com/crypto.tw_"
                    },
                    color: "#1F1AD9"
                }
            ]
        }
    }
}

// Pro 有什麼 Flex Message (會員福利說明) - 場景導向版本
const PRO_BENEFITS_FLEX_MESSAGE = {
    type: "flex",
    altText: "Pro 能幫你做什麼",
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
                            text: "⭐ Pro 能幫你做什麼",
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
                        // 1️⃣ 第一時間知道市場在動什麼
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "1️⃣", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "第一時間知道「市場在動什麼」", weight: "bold", size: "sm", color: "#333333", wrap: true },
                                        { type: "text", text: "即時市場快訊、重大事件推播，不錯過關鍵波動", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 2️⃣ 每天快速理解市場狀態
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "2️⃣", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "每天快速理解「市場狀態」", weight: "bold", size: "sm", color: "#333333", wrap: true },
                                        { type: "text", text: "AI 市場脈動，整合數據與情緒，判斷現在該觀望還是警戒", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 3️⃣ 用數據輔助決策
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "3️⃣", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "用數據輔助決策，而不是感覺", weight: "bold", size: "sm", color: "#333333", wrap: true },
                                        { type: "text", text: "AHR999、泡沫指數、巨鯨追蹤等 20+ 專業指標", size: "xs", color: "#666666", wrap: true }
                                    ]
                                }
                            ]
                        },
                        // 4️⃣ 提前知道影響行情的大事
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "4️⃣", size: "lg", flex: 0 },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    paddingStart: "md",
                                    flex: 1,
                                    contents: [
                                        { type: "text", text: "提前知道會影響行情的大事", weight: "bold", size: "sm", color: "#333333", wrap: true },
                                        { type: "text", text: "CPI、FOMC、非農等事件預警，幫你提前佈局", size: "xs", color: "#666666", wrap: true }
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
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "追蹤加密台灣 IG",
                        uri: "https://www.instagram.com/crypto.tw_"
                    },
                    color: "#1F1AD9"
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
                            text: "快速查詢",
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
                { type: "separator", margin: "lg", color: "#f0f0f0" },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "md",
                    contents: [
                        // 幣價查詢
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "幣價查詢", size: "sm", color: "#111111", weight: "bold", flex: 1 },
                                { type: "text", text: "BTC、ETH、SOL", size: "xs", color: "#888888", align: "end", flex: 2 }
                            ]
                        },
                        // 匯率查詢
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "匯率查詢", size: "sm", color: "#111111", weight: "bold", flex: 1 },
                                { type: "text", text: "USD、TWD", size: "xs", color: "#888888", align: "end", flex: 2 }
                            ]
                        },
                        // 換算
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "金額換算", size: "sm", color: "#111111", weight: "bold", flex: 1 },
                                { type: "text", text: "USD 1000", size: "xs", color: "#888888", align: "end", flex: 2 }
                            ]
                        }
                    ]
                },
                { type: "separator", margin: "lg", color: "#f0f0f0" },
                {
                    type: "text",
                    text: "直接輸入幣種或金額即可查詢",
                    size: "xxs",
                    color: "#aaaaaa",
                    margin: "md"
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
                        label: "📊 查看市場脈絡",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/`
                    },
                    color: "#1F1AD9"
                }
            ]
        }
    }
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
    const high = parseFloat(data.highPrice)
    const low = parseFloat(data.lowPrice)
    const changePercent = Math.abs(parseFloat(data.priceChangePercent))

    // ===== 狀態摘要邏輯 (規則式，不給建議) =====
    let statusText = ''
    if (changePercent >= 10) {
        statusText = '📊 近 24h 波動幅度偏大'
    } else if (changePercent >= 5) {
        statusText = '📊 近 24h 波動中等'
    } else if (changePercent < 2) {
        statusText = '📊 近 24h 波動相對收斂'
    } else {
        statusText = '📊 近 24h 波動正常'
    }

    // ===== 位置感邏輯 =====
    const range = high - low
    let positionText = ''
    if (range > 0) {
        const position = (price - low) / range
        if (position >= 0.8) {
            positionText = '接近區間上緣'
        } else if (position <= 0.2) {
            positionText = '接近區間下緣'
        } else {
            positionText = '位於區間中段'
        }
    } else {
        positionText = '波動極小'
    }

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
                    },
                    // 狀態摘要
                    {
                        type: "text",
                        text: statusText,
                        size: "xs",
                        color: "#666666",
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
                    // 24h 區間
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "24h 區間", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: `${formatPrice(low)} – ${formatPrice(high)}`, size: "sm", color: "#111111", align: "end", flex: 2 }
                        ],
                        margin: "md"
                    },
                    // 目前位置
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "目前位置", size: "sm", color: "#555555", flex: 1 },
                            { type: "text", text: positionText, size: "sm", color: "#888888", align: "end", flex: 2 }
                        ],
                        margin: "sm"
                    },
                    { type: "separator", margin: "md", color: "#f0f0f0" },
                    // 時間戳記
                    {
                        type: "text",
                        text: "⏱ 剛剛更新",
                        size: "xxs",
                        color: "#cccccc",
                        margin: "md"
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
                            label: "📸 追蹤 Instagram",
                            uri: "https://www.instagram.com/crypto.tw_"
                        },
                        color: "#1F1AD9"
                    },
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "uri",
                            label: "註冊 OKX 交易所",
                            uri: "https://www.okx.com/join/CTWPRO"
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

// function fetchForexRate() removed as per user request (Hide Bank Rate)

// Create Currency Converter Flex Message
function createCurrencyCard(maxData: any, bitoData: any, hoyaData: any, currencyParsed?: { type: 'USD' | 'TWD', amount: number }) {
    // MAX Data (即時掛單)
    const maxBuyRef = parseFloat(maxData.sell) // User Buys (Ask)
    const maxSellRef = parseFloat(maxData.buy) // User Sells (Bid)

    // Bito Data (即時掛單)
    let bitoBuyRef = Infinity // Lower is better for buy
    let bitoSellRef = 0 // Higher is better for sell
    if (bitoData && bitoData.asks && bitoData.bids) {
        bitoBuyRef = parseFloat(bitoData.asks[0].price)
        bitoSellRef = parseFloat(bitoData.bids[0].price)
    }

    // Hoyabit Data (快兌)
    // Note: If API fails/returns 0, ignore
    const hoyaBuyRef = hoyaData?.buy || Infinity
    const hoyaSellRef = hoyaData?.sell || 0

    // ===== 買入成本比較 (Ask) - User paying TWD to get USDT =====
    // We want the Lowest Ask Price
    let bestBuyExchange = 'MAX'
    let bestBuyPrice = maxBuyRef

    if (bitoBuyRef > 0 && bitoBuyRef < bestBuyPrice) {
        bestBuyExchange = 'BitoPro'
        bestBuyPrice = bitoBuyRef
    }
    if (hoyaBuyRef > 0 && hoyaBuyRef < bestBuyPrice) {
        bestBuyExchange = 'HOYA BIT'
        bestBuyPrice = hoyaBuyRef
    }

    // ===== 賣出回收比較 (Bid) - User selling USDT to get TWD =====
    // We want the Highest Bid Price
    let bestSellExchange = 'MAX'
    let bestSellPrice = maxSellRef

    if (bitoSellRef > 0 && bitoSellRef > bestSellPrice) {
        bestSellExchange = 'BitoPro'
        bestSellPrice = bitoSellRef
    }
    if (hoyaSellRef > 0 && hoyaSellRef > bestSellPrice) {
        bestSellExchange = 'HOYA BIT'
        bestSellPrice = hoyaSellRef
    }

    // Calculation Logic
    const amount = currencyParsed?.amount || 1
    const isTwdInput = currencyParsed?.type === 'TWD'

    // Result Text Calculation
    // If TWD Input (e.g. 1000):
    // Buy U: 1000 / Price
    // Sell U: 1000 * Price (Hypothetical: "If you sold 1000 U")
    const buyTotal = (amount / bestBuyPrice)
    const sellTotal = (amount * bestSellPrice)

    const buyTotalStr = isTwdInput
        ? `${buyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT`
        : `${buyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT` // Default reference

    // If input is 1000 TWD, showing "Sell 1000 USDT" might be confusing, but user asked for "Total Amount".
    // Let's format nicely.
    const sellTotalStr = `${Math.round(sellTotal).toLocaleString()} TWD`

    // Header Content
    // Header Title -> "換算結果" (Fixed)
    // Header Sub -> "在 [Exchange] 買入/賣出 [Amount] [Currency]" (Black small text)

    let headerTitle = "匯率快訊 (USDT/TWD)"
    let headerValue = ""
    let headerSub = ""

    if (currencyParsed) {
        headerTitle = "換算結果"
        if (isTwdInput) {
            // User wants to Buy U (Input TWD)
            // e.g. "在 HOYA BIT 買入 1,000 TWD"
            headerValue = `${buyTotalStr}`
            headerSub = `在 ${bestBuyExchange} 買入 ${amount.toLocaleString()} TWD`
        } else {
            // User wants to Sell U (Input USDT)
            // e.g. "在 MAX 賣出 500 USDT"
            headerValue = `${sellTotalStr}`
            headerSub = `在 ${bestSellExchange} 賣出 ${amount.toLocaleString()} USDT`
        }
    }

    return {
        type: "flex",
        altText: `最佳匯率: ${bestBuyPrice}`,
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
                            { type: "text", text: headerTitle, weight: "bold", size: "lg", color: "#1F1AD9", flex: 1 },
                            { type: "text", text: "加密台灣 Pro", size: "xxs", color: "#888888", align: "end", gravity: "center" }
                        ]
                    },
                    ...(headerValue ? [{
                        type: "text",
                        text: headerValue,
                        weight: "bold",
                        size: "xxl",
                        color: "#111111",
                        margin: "md",
                        wrap: true
                    } as any] : []),
                    // Bold the Exchange Name via nested contents
                    ...(headerSub ? [{
                        type: "text",
                        contents: [
                            { type: "span", text: "在 " },
                            { type: "span", text: (isTwdInput ? bestBuyExchange : bestSellExchange), weight: "bold", color: "#000000" },
                            { type: "span", text: (isTwdInput ? ` 買入 ${amount.toLocaleString()} TWD` : ` 賣出 ${amount.toLocaleString()} USDT`) }
                        ],
                        size: "sm",
                        color: "#555555",
                        margin: "sm"
                    } as any] : [])
                ]
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    // 表頭
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "交易所", size: "xs", color: "#888888", flex: 2 },
                            { type: "text", text: "買 U (Ask)", size: "xs", color: "#aaaaaa", align: "end", flex: 1 },
                            { type: "text", text: "賣 U (Bid)", size: "xs", color: "#aaaaaa", align: "end", flex: 1 }
                        ]
                    },
                    { type: "separator", margin: "sm", color: "#f0f0f0" },

                    // MAX
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "MAX", size: "md", color: "#111111", weight: "bold", flex: 2 },
                            { type: "text", text: `${maxBuyRef}`, size: "sm", color: maxBuyRef === bestBuyPrice ? "#00B900" : "#bbbbbb", align: "end", weight: maxBuyRef === bestBuyPrice ? "bold" : "regular", flex: 1 },
                            { type: "text", text: `${maxSellRef}`, size: "sm", color: maxSellRef === bestSellPrice ? "#D00000" : "#bbbbbb", align: "end", weight: maxSellRef === bestSellPrice ? "bold" : "regular", flex: 1 }
                        ],
                        margin: "md"
                    },
                    // BitoPro
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "BitoPro", size: "md", color: "#111111", weight: "bold", flex: 2 },
                            { type: "text", text: bitoBuyRef !== Infinity ? `${bitoBuyRef}` : '--', size: "sm", color: bitoBuyRef === bestBuyPrice ? "#00B900" : "#bbbbbb", align: "end", weight: bitoBuyRef === bestBuyPrice ? "bold" : "regular", flex: 1 },
                            { type: "text", text: bitoSellRef > 0 ? `${bitoSellRef}` : '--', size: "sm", color: bitoSellRef === bestSellPrice ? "#D00000" : "#bbbbbb", align: "end", weight: bitoSellRef === bestSellPrice ? "bold" : "regular", flex: 1 }
                        ],
                        margin: "sm"
                    },
                    // HOYA BIT
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "HOYA BIT", size: "md", color: "#111111", weight: "bold", flex: 2 },
                            { type: "text", text: hoyaBuyRef !== Infinity ? `${hoyaBuyRef}` : '--', size: "sm", color: hoyaBuyRef === bestBuyPrice ? "#00B900" : "#bbbbbb", align: "end", weight: hoyaBuyRef === bestBuyPrice ? "bold" : "regular", flex: 1 },
                            { type: "text", text: hoyaSellRef > 0 ? `${hoyaSellRef}` : '--', size: "sm", color: hoyaSellRef === bestSellPrice ? "#D00000" : "#bbbbbb", align: "end", weight: hoyaSellRef === bestSellPrice ? "bold" : "regular", flex: 1 }
                        ],
                        margin: "sm"
                    },

                    { type: "separator", margin: "md", color: "#f0f0f0" },

                    // 時間戳記
                    {
                        type: "text",
                        text: `更新時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
                        size: "xxs",
                        color: "#cccccc",
                        margin: "lg",
                        align: "center"
                    }
                ]
            },

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








                // C. Currency Converter & Rates - 自然語言版本
                // 支援: #TWD 1000, USD 5000, 1000美金, 換1000u, #TWD (純查匯率)
                const currencyParsed = parseCurrencyAmount(originalText)
                // 純查匯率（不帶金額）
                const isRateOnlyQuery = /^[#@$]?(TWD|USD|USDT)$/i.test(text) || originalText === '匯率' || originalText === '匯率查詢'

                if (currencyParsed || isRateOnlyQuery) {
                    const [maxData, bitoData, hoyaData] = await Promise.all([
                        fetchMaxTicker(),
                        fetchBitoOrderBook(),
                        getHoyabitPrices()
                    ])

                    if (maxData) {
                        const flexMsg = createCurrencyCard(
                            maxData,
                            bitoData,
                            hoyaData,
                            currencyParsed || undefined
                        )
                        await replyMessage(replyToken, [flexMsg])
                    } else {
                        await replyMessage(replyToken, [{ type: "text", text: "⚠️ 目前無法取得匯率資訊，請稍後再試。" }])
                    }
                    continue
                }

                // D. Crypto Price Check - 自然語言版本
                // 支援: BTC, #BTC, 比特幣, ETH價格, 現在SOL
                const coinSymbol = parseCoinSymbol(originalText)

                if (coinSymbol) {
                    // Skip currency codes
                    if (['TWD', 'USD', 'USDT', 'HOT', 'TOP', 'RANK'].includes(coinSymbol)) continue

                    const ticker = await fetchCryptoTicker(coinSymbol)


                    if (ticker) {
                        const priceCard = createPriceCard(ticker)


                        // Check if we should show the dashboard for this token
                        // We try to fetch for ALL tokens, but only show if data exists (has Open Interest).
                        const { getMarketSnapshot } = await import('@/lib/market-aggregator')
                        const { createMiniAnalysisCard } = await import('@/lib/flex-market-dashboard')

                        // Pass the coin symbol to get specific data
                        // getMarketSnapshot handles defaults gracefully
                        const marketData = await getMarketSnapshot(coinSymbol)

                        // Check if we actually have valid Futures data
                        // If Total Open Interest > 0, it means Coinglass tracks this token's futures.
                        const hasFuturesData = (marketData.capital_flow?.open_interest_total || 0) > 0

                        if (hasFuturesData) {
                            const analysisCard = createMiniAnalysisCard(marketData)
                            await replyMessage(replyToken, [priceCard, analysisCard])
                        } else {
                            // No futures data (Spot only or unsupported by Coinglass), show Price Card only
                            await replyMessage(replyToken, [priceCard])
                        }
                    } else {
                        // Fallback: Try Stock Ticker (e.g. NVDA, MSTR, COIN)
                        const { fetchStockTicker, createStockCard } = await import('@/lib/stocks')
                        const stockData = await fetchStockTicker(coinSymbol)

                        if (stockData) {
                            const stockCard = createStockCard(stockData)
                            await replyMessage(replyToken, [stockCard])
                        } else {
                            await replyMessage(replyToken, [{
                                type: "text",
                                text: `⚠️ 找不到 "${coinSymbol}" 的加密貨幣或美股資訊。`
                            }])
                        }
                    }
                    continue
                }

                // ===== E. 低頻柔性引導 (Fallback) =====
                // 每個用戶每 6 小時最多收到一次提示
                const userId = event.source.userId
                if (userId && originalText.length >= 2 && originalText.length <= 20) {
                    const now = Date.now()
                    const lastHintTime = fallbackHintCache.get(userId) || 0
                    const SIX_HOURS = 6 * 60 * 60 * 1000

                    if (now - lastHintTime > SIX_HOURS) {
                        fallbackHintCache.set(userId, now)
                        await replyMessage(replyToken, [{
                            type: "text",
                            text: "💡 我可以幫你查「幣價 / 匯率」\n\n例如：\n• BTC、比特幣、ETH\n• USD 1000、1萬美金"
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
