/**
 * CryptoTW Pro UI 命名常數
 * 
 * 集中管理全站所有卡片與區塊的顯示名稱，確保「極簡、直覺」。
 */

export const UI_LABELS = {
    // 全站
    BRAND_NAME: 'CryptoTW Pro',
    PRO_BADGE: 'PRO',

    // 首頁 (Apple Style: 極簡且聚焦價值)
    HOME: {
        HERO_TITLE: '市場 洞察',      // 移除診斷，強調與現狀的觀察
        STATUS_TITLE: '概覽',         // 快照 -> 概覽 (Overview)
        EVENTS_TITLE: '日曆',         // 關鍵事件 -> 日曆 (Calendar/Events)
        HISTORY_TITLE: '典藏',        // 歷史對比 -> 典藏 (Archive)
        SENTIMENT_TITLE: '情緒',      // 移除冗餘字眼
        ALPHA_TOOLS: '工具',          // 指標工具箱 -> 工具 (Tools)
        FREE_TOOLS: '常用',
    },

    // 洞察 (原指標)
    INSIGHTS: {
        ROOT_TITLE: '洞察',           // 數據指標 -> 洞察 (Insights)
        SENTIMENT: '情緒',
        LEVERAGE: '合約',
        LIQUIDATION: '清算',
        ON_CHAIN: '鏈上',
    },

    // 典藏 (原歷史/覆盤)
    ARCHIVE: {
        ROOT_TITLE: '典藏',           // 歷史覆盤 -> 典藏 (Archive)
        EVENT_DETAIL: '詳情',         // 事件詳情 -> 詳情
    },

    // 簡報 (原新聞)
    BRIEFING: {
        ROOT_TITLE: '簡報',           // 新聞快訊 -> 簡報 (Briefing)
    },

    // 智慧 (原 AI 相關)
    INTELLIGENCE: {
        ASSISTANT: '智慧助理',        // AI 助理 -> 智慧助理
        DIGEST: '速覽',               // AI 快讀 -> 速覽 (Digest)
        ANALYZING: '正在分析數據',
    },

    // 個人
    ME: {
        ROOT_TITLE: '個人',           // 個人中心 -> 個人 (Me)
        BINDING: '連結',
        NOTIFICATIONS: '通知',
    }
} as const;
