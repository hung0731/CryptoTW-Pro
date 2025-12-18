import { StaticImageData } from 'next/image'

export interface QuizQuestion {
    id: number
    text: string
    options: {
        text: string
        score: {
            d?: number // Degen
            h?: number // Hodler
            t?: number // Technical
            e?: number // Emotional (FOMO)
        }
    }[]
}

export interface QuizResult {
    id: string
    name: string
    tagline: string
    description: string
    image: string // Path to image
    stats: {
        survivalRate: number // %
        winRate: number // %
    }
    traits: {
        strength: string
        weakness: string
        naturalEnemy: string // The "Predator"
        food: string // The "Prey"
    }
    productHook: {
        text: string
        link: string
        btnText: string
    }
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        text: "比特幣突然暴跌 10%，你的第一反應是？",
        options: [
            { text: "立刻打開合約，反手做空！", score: { d: 2, e: 1 } },
            { text: "這是抄底的好機會，分批買入。", score: { h: 2, t: 1 } },
            { text: "嚇死我了，先清倉觀望。", score: { e: 2 } },
            { text: "沒感覺，我只看週線。", score: { h: 2 } }
        ]
    },
    {
        id: 2,
        text: "你看到一個新迷因幣 (Meme Coin) 正在暴漲，你會？",
        options: [
            { text: "直接衝進去，贏了會所嫩模！", score: { d: 2, e: 1 } },
            { text: "這肯定是詐騙，這是不理性的泡沫。", score: { t: 2 } },
            { text: "觀察一下社群熱度，有很多人討論再買。", score: { e: 2 } },
            { text: "研究它的合約代碼和持倉分佈。", score: { t: 2, h: 1 } }
        ]
    },
    {
        id: 3,
        text: "你通常持有一張單子多久？",
        options: [
            { text: "幾分鐘到幾小時，我是當沖手。", score: { d: 2 } },
            { text: "幾天到幾週，吃一段波段。", score: { t: 2 } },
            { text: "直到財富自由，HODL。", score: { h: 2 } },
            { text: "看心情，虧了就拿著，賺了就跑。", score: { e: 3 } } // High Hamster energy
        ]
    },
    {
        id: 4,
        text: "你最常用的分析工具是？",
        options: [
            { text: "感覺 (Intuition) 和 Twitter。", score: { e: 2, d: 1 } },
            { text: "K線圖、RSI、MACD。", score: { t: 2 } },
            { text: "基本面報告、項目白皮書。", score: { h: 2 } },
            { text: "資金費率、清算地圖、多空比。", score: { t: 1, d: 1 } }
        ]
    }
]

export const QUIZ_RESULTS: Record<string, QuizResult> = {
    lion: {
        id: 'lion',
        name: '鎮山雄獅 (The Holder)',
        tagline: '耐心是你的狩獵本能',
        description: '你擁有常人難以企及的耐心。你不屑於短線的波動，專注於長期的價值。市場的雜訊對你來說只是微風拂面。但小心，不要睡太久錯過逃頂機會。',
        image: '/images/quiz/quiz_lion_king_1766057390779.png',
        stats: {
            survivalRate: 85,
            winRate: 60
        },
        traits: {
            strength: '心態極穩，不易被割',
            weakness: '反應較慢，資金利用率低',
            naturalEnemy: '高頻量化機器人 (他們偷你的波段)',
            food: '恐慌拋售的倉鼠'
        },
        productHook: {
            text: '你需要更精準的逃頂信號，別讓獲利回吐。',
            link: '/indicators/mvrv',
            btnText: '查看 MVRV 逃頂指標'
        }
    },
    wolf: {
        id: 'wolf',
        name: '嗜血孤狼 (The Hunter)',
        tagline: '嗅覺靈敏，咬一口就跑',
        description: '你是天生的交易員，對數字和波動極其敏感。你喜歡高槓桿、快進快出。你吃的是市場的波動率，但常在河邊走，哪有不濕鞋？',
        image: '/images/quiz/quiz_wolf_hunter_1766057410267.png',
        stats: {
            survivalRate: 40,
            winRate: 55
        },
        traits: {
            strength: '爆發力強，短期獲利高',
            weakness: '容易過度交易 (Over-trading)',
            naturalEnemy: '交易所插針 (專殺高倍)',
            food: '無腦追高的倉鼠'
        },
        productHook: {
            text: '高頻交易最怕不知道主力動向。',
            link: '/indicators/funding-rate',
            btnText: '查看資金費率熱圖'
        }
    },
    hamster: {
        id: 'hamster',
        name: 'FOMO 倉鼠 (The Follower)',
        tagline: '什麼都想屯，但手太抖',
        description: '你對市場充滿熱情，但容易被情緒左右。漲了想追，跌了想割。你的錢包常常因為手續費和追高殺低而縮水。別擔心，這也是成長的過程。',
        image: '/images/quiz/quiz_hamster_fomo_1766057427213.png',
        stats: {
            survivalRate: 15,
            winRate: 30
        },
        traits: {
            strength: '提供市場流動性 (好人)',
            weakness: '情緒化、容易被消息面誤導',
            naturalEnemy: '所有人 (獅子、狼、鯨魚都吃你)',
            food: '...空氣？'
        },
        productHook: {
            text: '你需要 AI 風控官來阻止你的衝動。',
            link: '/indicators', // Or link to the future AI chat
            btnText: '查看市場情緒儀表板'
        }
    },
    whale: {
        id: 'whale',
        name: '深海巨鯨 (The Mover)',
        tagline: '我在，故市場在',
        description: '你或許資金雄厚，或者擁有看透本質的智慧。你的一舉一動都可能引發漣漪。你不需要追逐浪花，因為你就是海浪本身。',
        image: '/images/quiz/quiz_whale_mover_1766057446781.png',
        stats: {
            survivalRate: 98,
            winRate: 80
        },
        traits: {
            strength: '資本優勢，資訊不對稱',
            weakness: '流動性風險',
            naturalEnemy: '監管機構 (SEC)',
            food: '狼與獅子'
        },
        productHook: {
            text: '觀察其他巨鯨的動向，知己知彼。',
            link: '/indicators/liquidation',
            btnText: '查看清算地圖'
        }
    }
}

export function calculateQuizResult(scores: { d: number, h: number, t: number, e: number }): QuizResult {
    // Simple logic: Max score determines type
    // D > others -> Wolf (Degen/Hunter)
    // H > others -> Lion (Holder)
    // E > others -> Hamster (Emotional)
    // T > others -> Whale (Smart/Tech - mapped loosely for MVP)

    // Default to Hamster if tie or low scores
    let type = 'hamster'
    let maxScore = -1

    // Map internal scores to Archetypes
    const mapping = {
        d: 'wolf',
        h: 'lion',
        e: 'hamster',
        t: 'whale' // Map Technical to Whale for this MVP context
    }

    for (const [key, value] of Object.entries(scores)) {
        if (value > maxScore) {
            maxScore = value
            type = mapping[key as keyof typeof mapping]
        }
    }

    return QUIZ_RESULTS[type]
}
