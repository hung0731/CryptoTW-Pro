
export interface MacroEventDefinition {
    id: string
    keywords: string[] // English keywords (partial match, case insensitive)
    titleTW: string
    tier: 'S' | 'A'
    whyImportant: string
    cryptoReaction: string
}

export const MACRO_EVENTS: MacroEventDefinition[] = [
    {
        id: 'fomc_rate',
        keywords: ['Fed Interest Rate Decision', 'FOMC Rate Decision', 'Federal Funds Rate', 'FOMC Statement'],
        titleTW: '聯準會利率決議 (FOMC)',
        tier: 'S',
        whyImportant: '聯準會利率決策直接決定美元流動性與全球資金成本。利率越高，流動性越緊縮，風險資產 (加密貨幣) 壓力越大；反之則為重大利好。',
        cryptoReaction: '市場最關注利率是否「維持不變」或「降息」。若點陣圖或發言釋放「鷹派」(不降息) 訊號，幣價通常急跌；若釋放「鴿派」訊號，通常會暴力反彈。'
    },
    {
        id: 'cpi',
        keywords: ['CPI (YoY)', 'CPI (MoM)', 'Consumer Price Index', 'Core CPI'],
        titleTW: '消費者物價指數 (CPI)',
        tier: 'S',
        whyImportant: '這是聯準會最關注的「通膨」數據。CPI 過高代表通膨嚴重，聯準會被迫維持高利率 (利空)；CPI 降溫則給予聯準會降息空間 (利多)。',
        cryptoReaction: '公布值若「高於預期」，引發升息恐慌，幣價通常跳水下跌；若「低於預期」，代表通膨受控，市場會歡慶上漲。波動極大，建議避開公布瞬間。'
    },
    {
        id: 'pce',
        keywords: ['PCE Price Index', 'Core PCE'],
        titleTW: 'PCE 個人消費支出 (通膨指標)',
        tier: 'S',
        whyImportant: '聯準會最青睞的真實通膨指標 (比 CPI 更準確)。這是決定下一次 FOMC 會議是否調整利率的關鍵數據。',
        cryptoReaction: '與 CPI 邏輯一致。數據下降代表通膨放緩，利好加密市場；數據反彈則利空。通常市場反應會比 CPI 小一點，但依然關鍵。'
    },
    {
        id: 'nonfarm',
        keywords: ['Nonfarm Payrolls', 'Non-Farm Employment Change'],
        titleTW: '非農就業人口 (NFP)',
        tier: 'S',
        whyImportant: '反映美國經濟與勞動力市場的冷熱。就業太強勁 (數據高) 代表薪資通膨難降，聯準會不敢降息；就業降溫則增加降息機率。',
        cryptoReaction: '「壞消息就是好消息」：數據低於預期 (經濟降溫) 通常利好幣市 (降息預期)；數據爆高則被視為利空 (高利率將維持更久)。'
    },
    {
        id: 'unemployment',
        keywords: ['Unemployment Rate'],
        titleTW: '美國失業率',
        tier: 'A',
        whyImportant: '與非農數據搭配觀察。失業率微幅上升代表經濟軟著陸，有利降息；但若失業率飆升，市場會恐慌「經濟衰退」，可能導致崩盤。',
        cryptoReaction: '符合預期或微升通常偏多解讀。若大幅低於預期 (>就業過強 >難降息)，短線偏空。'
    },
    {
        id: 'powell_speech',
        keywords: ['Fed Chair Powell Speaks', 'FOMC Press Conference'],
        titleTW: '鮑爾 (Powell) 談話 / 記者會',
        tier: 'S',
        whyImportant: '聯準會主席的每一句話都會被市場放大檢視。重點在於他對「未來利率路徑」的態度 (鷹派 vs 鴿派)。',
        cryptoReaction: '充滿不確定性。鮑爾常在記者會上演「反轉行情」：先跌後漲或先漲後跌。一定要等他說完話再操作。'
    },
    {
        id: 'gdp',
        keywords: ['Gross Domestic Product', 'GDP (QoQ)', 'GDP Growth'],
        titleTW: '美國 GDP (季度)',
        tier: 'A',
        whyImportant: '衡量美國經濟整體健康度。主要用來判斷是否有「衰退」風險。',
        cryptoReaction: '影響通常較短暫。若 GDP 大幅衰退 (硬著陸恐慌) 可能帶崩市場；若數據穩健 (軟著陸)，則有利比特幣長線走勢。'
    },
    {
        id: 'ism_pmi',
        keywords: ['ISM Manufacturing PMI', 'ISM Services PMI'],
        titleTW: 'ISM 採購經理人指數 (PMI)',
        tier: 'A',
        whyImportant: '50為榮枯線。由採購經理人調查得出的領先指標，最快反映企業是否看好未來景氣。',
        cryptoReaction: '通常影響中性，但若數據意外跌破榮枯線 (50)，會引發衰退擔憂。'
    }
]

// Helper to find event definition
export function enrichMacroEvent(englishTitle: string): MacroEventDefinition | null {
    const titleLower = englishTitle.toLowerCase()
    return MACRO_EVENTS.find(def =>
        def.keywords.some(k => titleLower.includes(k.toLowerCase()))
    ) || null
}
