export type GlossaryItem = {
    term: string
    definition: string
    category: 'defi' | 'trading' | 'general'
}

export const GLOSSARY_DATA: GlossaryItem[] = [
    { term: 'DeFi', definition: '去中心化金融 (Decentralized Finance)，指在區塊鏈上運作的金融服務，如借貸、交易，不需透過銀行。', category: 'defi' },
    { term: 'CeFi', definition: '中心化金融 (Centralized Finance)，指像幣安、OKX 這樣的交易所，由公司託管你的資產。', category: 'general' },
    { term: 'ROI', definition: '投資報酬率 (Return on Investment)，計算賺了多少錢的比例。', category: 'trading' },
    { term: 'KYC', definition: '實名認證 (Know Your Customer)，交易所為了合規，要求用戶上傳身分證件。', category: 'general' },
    { term: 'FOMO', definition: '錯失恐懼症 (Fear of Missing Out)，看到幣價漲了就想追高，怕賺不到。', category: 'general' },
    { term: 'FUD', definition: '恐懼、疑惑、懷疑 (Fear, Uncertainty, Doubt)，指散布負面消息讓大家恐慌拋售。', category: 'general' },
    { term: 'HODL', definition: '死拿不放 (Hold On for Dear Life)，不管跌多少都不賣，信仰堅定。', category: 'general' },
    { term: 'RSI', definition: '相對強弱指標 (Relative Strength Index)，用來判斷超買或超賣。超過 70 通常過熱，低於 30 通常超賣。', category: 'trading' },
    { term: 'DCA', definition: '平均成本法 (Dollar Cost Averaging)，定期定額買入，分攤成本，避免買在最高點。', category: 'trading' },
    { term: 'Gas', definition: '礦工費 (Gas Fee)，在區塊鏈上轉帳或操作需要付給礦工的手續費。', category: 'defi' },
]
