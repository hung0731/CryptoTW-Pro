import { LucideIcon, Wallet, GraduationCap, BarChart2, Calendar, LineChart, Shield, Trophy } from 'lucide-react'

// ==========================================
// Types
// ==========================================

export type QuizOption = {
    id: string
    text: string
    isCorrect: boolean
}

export type QuizQuestion = {
    id: string
    type: 'basic' | 'image' | 'scenario' | 'calculation'
    question: string
    image?: string // Path to image if needed
    options: QuizOption[]
    explanation: {
        text: string
        cta?: {
            label: string
            href: string
            type: 'internal' | 'external'
        }
    }
}

export type Quiz = {
    id: string
    title: string
    description: string
    questions: QuizQuestion[]
    rewardBadge?: string
}


export type ContentBlock =
    | { type: 'text', content: string }
    | { type: 'callout', title?: string, content: string, icon?: string, variant: 'info' | 'warning' | 'tip' }
    | { type: 'image', src: string, caption?: string }
    | { type: 'key-point', title: string, points: string[] }

export type LearnChapter = {
    id: string
    title: string
    blocks: ContentBlock[] // Changed from content: string to blocks
    practice: string
    cta: {
        label: string
        href: string
        type: 'internal' | 'external'
    }
    quiz: Quiz
}

export type LearnLevel = {
    id: string
    level: number
    title: string
    description: string
    icon: LucideIcon
    chapters: LearnChapter[]
}

// ==========================================
// Data: Level 0 - 6
// ==========================================

export const LEARN_LEVELS: LearnLevel[] = [
    {
        id: 'level-0',
        level: 0,
        title: '新手村：Web3 第一步',
        description: '別急著賺錢，先學會怎麼不虧錢。搞懂錢包、詐騙與基本觀念。',
        icon: Wallet,
        chapters: [
            {
                id: 'l0-c1',
                title: '錢包 101：熱錢包 vs 冷錢包',
                blocks: [
                    {
                        type: 'text',
                        content: `### 進入 Web3 的第一張門票
想要擁有比特幣或以太幣，你可以選擇放在交易所代管，也可以放在屬於自己的數位錢包。請記住一個核心觀念：錢包並不是像存錢筒一樣把幣存在裡面，它真正儲存的是你的私鑰，也就是動用資產的唯一權限。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '熱錢包 (Hot Wallet)',
                        content: `只要是連著網路的錢包軟體，都統稱為熱錢包。它的優勢在於方便快速，可以隨時隨地進行交易或連接去中心化應用程式 (DApp)。
常見的例子包括 Metamask (小狐狸)、Trust Wallet 以及 OKX Web3 Wallet。雖然好用，但因為長期連網，如果你的設備中了木馬病毒，資產就有被駭客轉走的風險。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '冷錢包 (Cold Wallet)',
                        content: `冷錢包通常是一個類似 USB 的實體硬體裝置。它的核心晶片永遠不會接觸網路，因此駭客無法透過網路攻擊竊取你的私鑰。
常見品牌有 Ledger、Trezor 和 OneKey。這就像是你數位資產的保險箱，雖然操作上需要按實體按鈕比較麻煩，且需要購買成本，但對於長期儲存大額資產來說，這是最安全的選擇。`
                    },
                    {
                        type: 'text',
                        content: `簡單的配置建議：將日常操作的小額資金放在熱錢包，方便靈活使用；而將不想動用的大額身家鎖在冷錢包中，確保資產安全無虞。`
                    },
                    {
                        type: 'key-point',
                        title: '新手建議 🌱',
                        points: [
                            '如果是幾萬塊以內的小錢，使用熱錢包或放在大型交易所即可，重點是學習操作體驗。',
                            '如果是關乎身家的大錢，強烈建議購買硬體冷錢包，物理隔絕網路駭客。',
                            '下載錢包 App 時務必檢查是否為官方正版，絕對不要點擊搜尋引擎最上方的廣告連結，那很高機率是釣魚程式。'
                        ]
                    }
                ],
                practice: '是時候建立你的數位身分了。請去官方商店下載 OKX Web3 錢包或 Metamask，並按照步驟創建一個新的錢包地址。',
                cta: {
                    label: '下載 OKX Web3 錢包',
                    href: 'https://www.okx.com/web3',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c1',
                    title: '錢包種類隨堂考',
                    description: '選擇適合你的儲存方式',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '小明剛買了 10 顆比特幣準備放到退休 (HODL)，他應該存在哪裡最安全？',
                            options: [
                                { id: 'a', text: '熱錢包 (Metamask)', isCorrect: false },
                                { id: 'b', text: '冷錢包 (硬體錢包)', isCorrect: true },
                                { id: 'c', text: '放在交易所不領出來', isCorrect: false }
                            ],
                            explanation: {
                                text: '對於長期持有且金額龐大的資產，冷錢包 (Cold Wallet) 提供物理級別的網路隔離，是目前公認最安全的儲存方式。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c2',
                title: '資安核心：私鑰與助記詞',
                blocks: [
                    {
                        type: 'text',
                        content: `### 掌握最高權限
在區塊鏈的世界裡，沒有銀行客服可以幫你重設密碼。你需要認識兩個最重要的概念：
*   私鑰 (Private Key)：這就像是你銀行的印鑑章。任何擁有私鑰的人，都可以直接轉走錢包裡的所有資產。私鑰通常是一長串複雜的亂碼。
*   助記詞 (Seed Phrase)：為了讓你方便抄寫和備份，系統會將私鑰轉換成 12 或 24 個簡單的英文單字。`
                    },
                    {
                        type: 'text',
                        content: `請銘記在心：助記詞等於你的私鑰，也等於你的錢。誰擁有了這組助記詞，誰就是這個錢包真正的主人。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '死亡筆記本規則 💀',
                        content: `1. 絕對不要截圖：手機相簿通常會自動同步到雲端，駭客會用 AI 掃描雲端照片中的助記詞。
2. 絕對不要透過通訊軟體傳送：LINE、Messenger 或 Email 都有可能被監控或攔截。
3. 唯一的備份方式：用手寫。拿一張紙抄下來，檢查確認無誤後，鎖在抽屜或保險箱裡。`
                    }
                ],
                practice: '現在拿出紙筆，找出你剛剛創建錢包時的助記詞 (或在設定中查看)，重新檢查一次你是否抄寫正確。別忘了，這張紙比你的信用卡更重要。',
                cta: {
                    label: '了解更多資安知識',
                    href: 'https://www.okx.com/learn/security',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c2',
                    title: '助記詞安全測驗',
                    description: '這題錯了真的會破產',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '你在使用某個去中心化與 application (DApp) 時，網頁彈出視窗要求你輸入「助記詞」來連線，你該？',
                            options: [
                                { id: 'a', text: '輸入，因為是連線需求', isCorrect: false },
                                { id: 'b', text: '馬上關閉網頁，這是釣魚網站', isCorrect: true },
                                { id: 'c', text: '輸入一半看看', isCorrect: false }
                            ],
                            explanation: {
                                text: '正規的 DApp (如 Uniswap, OpenSea) 只會要求你「連接錢包 (Connect Wallet)」，絕對不會要求你輸入助記詞。只要看到網頁要你填助記詞，百分之百是詐騙。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c3',
                title: 'CEX vs DEX：交易所大戰',
                blocks: [
                    {
                        type: 'text',
                        content: `### 中心化與去中心化的抉擇
剛進入幣圈，你會接觸到兩種截然不同的交易場所：

中心化交易所 (CEX)
像 Binance、OKX 或台灣的 MAX。這就像傳統銀行，你需要註冊帳號、驗證身分 (KYC)。優點是有客服支援，操作介面親民，且可以用台幣出入金。缺點是如果交易所倒閉 (如 FTX 事件)，你的資產可能會拿不回來。

去中心化交易所 (DEX)
像 Uniswap、Curve。這就像自動販賣機，沒有客服、不需要註冊，僅憑錢包連線即可交易。優點是完全匿名且資產由自己掌控，缺點是操作門檻較高，若自己操作失誤 (如轉錯鏈) 無人能救。`
                    },
                    {
                        type: 'key-point',
                        title: '最佳組合建議 ✅',
                        points: [
                            '新手使用 CEX (如 OKX) 進行台幣與 USDT 的兌換，操作最便捷。',
                            '進階後可以用 DEX 去探索那些還沒上大交易所的潛力幣種。',
                            '獲利豐厚時，記得將資產轉回自己的冷錢包妥善保存。'
                        ]
                    }
                ],
                practice: '打開你的交易所 App (CEX) 看看它的介面，再用錢包瀏覽器打開 Uniswap (DEX) 連接錢包，感受兩者操作邏輯的巨大差異。',
                cta: {
                    label: '註冊 OKX (CEX 首選)',
                    href: 'https://www.okx.com/join/CTWPRO',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c3',
                    title: '交易所選擇題',
                    description: '搞懂你的交易場所',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '如果我忘記了登入密碼，哪一種交易所可以找客服幫我重設？',
                            options: [
                                { id: 'a', text: 'CEX (中心化交易所)', isCorrect: true },
                                { id: 'b', text: 'DEX (去中心化交易所)', isCorrect: false },
                            ],
                            explanation: {
                                text: 'CEX 就像銀行，有中心化的客服團隊可以協助你重設密碼。DEX 則是完全去中心化的代碼，你是自己銀行的行長，一旦弄丟私鑰，沒有任何人能幫你找回。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c4',
                title: '穩定幣：幣圈的美元與台幣',
                blocks: [
                    {
                        type: 'text',
                        content: `### 為什麼我們需要穩定幣？
比特幣的價格波動劇烈，今天能買一個漢堡，明天可能只能買包薯條。為了讓加密貨幣能作為價值儲存與交易的媒介，穩定幣 (Stablecoin) 應運而生。
它們的價值通常錨定法定貨幣 (主要是美金)，維持 1 穩定幣約等於 1 美金的匯率。`
                    },
                    {
                        type: 'text',
                        content: `目前市場上的三大主流：
1. USDT (Tether)：歷史最悠久，市值最大，流通性最好。就像幣圈的現金，幾乎所有交易對都支援它。
2. USDC (Circle)：由美國合規公司發行，強調資產儲備透明，深受 DeFi 協議與法人機構信賴。
3. DAI (MakerDAO)：透過加密資產超額抵押生成的去中心化穩定幣。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '避險港灣 ⚓️',
                        content: '當比特幣或以太幣暴跌時，投資人通常會將資產賣成穩定幣 (USDT) 暫時避險，這稱為「空倉」。這讓你在保有資金購買力的同時，等待下一次的進場機會。'
                    }
                ],
                practice: '查看目前的 USDT/TWD 匯率。你會發現它通常比銀行的美金匯率稍微貴一點點，這中間的價差我們稱為「U 溢價」。',
                cta: {
                    label: '購買 USDT',
                    href: 'https://www.okx.com/buy-crypto',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c4',
                    title: '穩定幣認知',
                    description: '你的資金避風港',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '為什麼 USDT 被稱為穩定幣？',
                            options: [
                                { id: 'a', text: '因為它的價格永遠不會變', isCorrect: false },
                                { id: 'b', text: '因為它錨定美元，價值維持在 1 USD 左右', isCorrect: true },
                                { id: 'c', text: '因為它是政府發行的', isCorrect: false }
                            ],
                            explanation: {
                                text: '穩定幣的設計目標是維持與法幣 (如美元) 1:1 的掛鉤，讓投資人在波動劇烈的加密市場中，也能有價值穩定的資產進行停泊或計價。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c5',
                title: '鏈與 Gas：為什麼轉帳會不見？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 這裡不是銀行轉帳
區塊鏈的世界由許多不同的「鏈」組成，你可以把它們想像成不同的平行宇宙。
以太坊 (Ethereum) 是一個宇宙，Solana 是另一個宇宙，波場 (Tron) 又是另一個。你不能直接把以太坊上的資產轉到 Solana 上，就像你不能拿新台幣直接在日本投幣搭公車一樣。`
                    },
                    {
                        type: 'text',
                        content: `常見的傳輸網路：
*   ERC20 (Ethereum)：最為通用但手續費 (Gas Fee) 最貴，尖峰時刻轉帳一次可能要幾十美金。
*   TRC20 (Tron)：手續費低廉，轉帳 USDT 通常只需 1 美金左右，是許多人常用的轉帳網路。
*   Solana：以速度快、費用極低著稱。
*   L2 (如 Arbitrum, Optimism)：為了幫以太坊擴容而生，繼承了安全性但費用便宜很多。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '轉帳鐵律',
                        content: '在進行提幣或轉帳時，務必確認接收方使用什麼鏈 (網路)，發送方就要選擇完全相同的鏈。如果選錯網路 (例如從 ERC20 轉到 TRC20 地址)，你的資產將會直接消失在區塊鏈的深淵中，無法找回。'
                    }
                ],
                practice: '開啟 OKX 的提幣頁面，選擇 USDT，觀察一下下拉選單中有多少種網路 (鏈) 可以選擇？比較看看它們顯示的手續費差異有多大。',
                cta: {
                    label: '去 OKX 體驗提幣介面',
                    href: 'https://www.okx.com/balance/withdrawal',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c5',
                    title: '轉帳生存題',
                    description: '這題沒過別想轉帳',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '朋友給了你一個 TRC20 的地址要你轉 USDT 給他，結果你在提幣時選了 ERC20 網路轉出。請問會發生什麼事？',
                            options: [
                                { id: 'a', text: '系統會自動幫你換鏈', isCorrect: false },
                                { id: 'b', text: '轉帳失敗，錢退回給你', isCorrect: false },
                                { id: 'c', text: '幣會消失 (卡在鏈上)，通常找不回來', isCorrect: true }
                            ],
                            explanation: {
                                text: '區塊鏈是互不相通的平行世界。選錯網路就像寄信寫錯地址且寄到了火星，你的資產會永久遺失。這是新手最常犯也最昂貴的錯誤。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c6',
                title: '詐騙百科：別當肥羊',
                blocks: [
                    {
                        type: 'text',
                        content: `### 貪婪是詐騙的溫床
在這個去中心化的世界裡，沒有法規會第一時間保護你。騙子並不可怕，可怕的是你想「不勞而獲」的心態。
常見的三大詐騙手法：

1. 殺豬盤 (Pig Butchering)
通常從交友軟體開始，透過噓寒問暖建立感情，接著帶你投資加密貨幣。一開始會讓你小賺提領，等你卸下心防投入大筆資金後，平台就會關閉，人也會憑空消失。

2. 釣魚連結 (Phishing)
偽裝成官方 Email 通知你錢包異常，或是購買 Google 關鍵字廣告置頂假的交易所網站。一旦你點擊連結並授權錢包，你的資產就會被瞬間轉空。

3. 假空投 (Fake Airdrop)
你的錢包突然多了一種不知名的代幣，價值顯示好幾萬美金。當你貪心地想去網站把這些幣賣掉時，授權的過程會導致你的主資產 (ETH/USDT) 被盜走。`
                    },
                    {
                        type: 'key-point',
                        title: '防詐口訣',
                        points: [
                            '來路不明的連結絕對不點。',
                            '主動私訊教你賺錢的百分之百是詐騙。',
                            '保證獲利的投資方案一定是騙局。',
                            '天上掉下來的禮物 (空投)，往往是致命的陷阱。'
                        ]
                    }
                ],
                practice: '開啟你通訊軟體的陌生訊息過濾功能。並且時刻提醒自己：在幣圈，任何主動對你過分熱心的人，通常都是想從你身上拿到錢。',
                cta: {
                    label: '閱讀 OKX 防詐指南',
                    href: 'https://www.okx.com/learn/security',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c6',
                    title: '防詐意識檢測',
                    description: '最後一道防線',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '網路上認識的「分析師」說他有內線消息，叫你把錢轉到一個特定的 App 操作，還秀出他賺幾百萬的截圖。這是？',
                            options: [
                                { id: 'a', text: '殺豬盤詐騙', isCorrect: true },
                                { id: 'b', text: '千載難逢的機會', isCorrect: false },
                                { id: 'c', text: '普通的投資建議', isCorrect: false }
                            ],
                            explanation: {
                                text: '這就是典型的殺豬盤腳本。正規的投資會在全球知名的交易所 (如 Binance, OKX) 進行，絕對不會要求你下載來路不明的 App 或匯款給個人帳戶。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-1',
        level: 1,
        title: '工具篇：交易所完全手冊',
        description: '工欲善其事，必先利其器。學會現貨、合約與網格交易。',
        icon: GraduationCap,
        chapters: [
            {
                id: 'l1-c1',
                title: 'KYC 與出入金：把台幣變 USDT',
                blocks: [
                    {
                        type: 'text',
                        content: `### 為什麼交易所都要身分證？(KYC)
這就是所謂的 KYC (Know Your Customer)。雖然麻煩，但這是為了防止洗錢，同時也是保護你的一層保障。如果交易所不幸發生意外或倒閉，有完成實名認證的用戶才有機會透過法律途徑申訴求償。

### 入金的三條主要路徑
1. 信用卡買幣
最快，但手續費最貴 (通常 3%~5%)。除非急用，否則不推薦。

2. C2C (P2P) 交易
這是目前最主流的方式。在 OKX 等大平台上，你直接轉帳台幣給賣家，平台會鎖住對方的幣做擔保。優點是免手續費且匯率通常最好。

3. 台灣合規交易所 (如 MAX/BitoPro)
這是最保守安全的做法。你先把台幣轉帳到台灣合規的交易所帳戶，買成 USDT，再提幣轉到國際交易所。雖然步驟多了一層，但資產來源最乾淨確實。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: 'C2C 交易禁忌',
                        content: '在轉帳給賣家時，備註欄位請保持空白或只寫「一般轉帳」。絕對不要寫「比特幣」、「Crypto」、「購買 USDT」等字眼，否則銀行風控系統一旦偵測到，很高機率會直接凍結你的銀行帳戶。'
                    }
                ],
                practice: '去 OKX 的 C2C (P2P) 交易區逛逛，看看現在 1 USDT 賣多少台幣？觀察不同商家的成單量與評價，找找看有沒有「神盾商家」。',
                cta: {
                    label: '去 OKX C2C 買幣',
                    href: 'https://www.okx.com/p2p-markets/twd/buy-usdt',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c1',
                    title: '出入金安全檢測',
                    description: '防止被銀行鎖卡',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '在進行 C2C (P2P) 轉帳給賣家時，備註欄該寫什麼？',
                            options: [
                                { id: 'a', text: '購買 USDT', isCorrect: false },
                                { id: 'b', text: '比特幣投資', isCorrect: false },
                                { id: 'c', text: '什麼都不要寫，或寫真實姓名', isCorrect: true }
                            ],
                            explanation: {
                                text: '為了避免觸發銀行風控導致帳戶被凍結，絕對不要在備註提及任何加密貨幣相關字眼。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c2',
                title: '現貨 vs 合約：買蘋果 vs 賭價格',
                blocks: [
                    {
                        type: 'text',
                        content: `### 到底什麼是合約 (Futures)？
很多新手分不清楚這兩者的區別，用一個簡單的例子你就懂了：

現貨 (Spot)
你花 30 元買了一顆蘋果。這顆蘋果是你的，你可以把它帶回家、放冰箱、或是送給朋友。
*   如果蘋果漲到 50 元，你賺 20 元。
*   如果蘋果跌到 10 元，你虧 20 元，但蘋果還在。只要你不賣，就只是帳面虧損。

合約 (Futures)
你沒有買蘋果，你只是跟莊家「對賭」蘋果明天的價格。
*   你猜明天會漲，這叫「做多 (Long)」。
*   你猜明天會跌，這叫「做空 (Short)」。
*   因為你沒有真正擁有蘋果，所以如果看錯方向虧損超過了你的本金，你的單子就會被「強制平倉 (爆倉)」，本金歸零。`
                    },
                    {
                        type: 'key-point',
                        title: '新手建議',
                        points: [
                            '新手請從「現貨」開始。現貨最大的優點是不會歸零，只要幣還在，就有漲回來的希望。',
                            '合約雖然可以賺快錢 (利用槓桿)，但也是讓 90% 新手破產的元兇。',
                            '絕對不要用「身家」去玩合約。'
                        ]
                    }
                ],
                practice: '在交易所介面中切換「現貨 (Spot)」和「合約 (Perpetual)」的頁面，觀察兩者下單介面有什麼不同？(合約多了槓桿倍數的調整)',
                cta: {
                    label: '去 OKX 模擬盤練習',
                    href: 'https://www.okx.com/trade-market/demo',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c2',
                    title: '交易本質測驗',
                    description: '搞懂再下單',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '小明花 1000 U 買了比特幣。過了一個月比特幣腰斬跌了 50%，小明現在帳戶顯示剩下 500 U。請問如果他堅持不賣出，他的比特幣數量會變少嗎？',
                            options: [
                                { id: 'a', text: '會，被扣掉了一半', isCorrect: false },
                                { id: 'b', text: '不會，數量不變，只是價值變低了 (浮虧)', isCorrect: true },
                            ],
                            explanation: {
                                text: '這就是現貨 (Spot) 的特性。你擁有的是資產的所有權，只要不賣出，幣的數量永遠不會變，虧損只是暫時的帳面數字。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c3',
                title: '限價單 vs 市價單：別當盤子',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你想馬上成交，還是想省手續費？
下單時，你會看到兩種主要的委託方式：

市價單 (Market Order)
*   **意思**：「我不管現在多少錢，我現在馬上就要買到！」
*   **優點**：速度最快，保證成交。
*   **缺點**：成交價格通常比較差 (滑價)，而且手續費最貴 (因為你是消耗流動性的 Taker)。

限價單 (Limit Order)
*   **意思**：「我只想在 60,000 的價格買，太貴我不要。」
*   **優點**：可以買在指定的心儀價格，而且手續費比較便宜 (因為你是提供流動性的 Maker)。
*   **缺點**：如果市場沒跌到你的價格，你可能永遠買不到 (踏空)。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '掛單技巧',
                        content: '養成習慣多用限價單 (Limit Order)。如果你不是在十萬火急的暴漲暴跌時刻，掛單等待不只能幫你買在更好的價位，長期下來還能省下非常可觀的手續費。'
                    }
                ],
                practice: '試著掛一張「比現在價格低 5%」的限價買單。你會在「當前委託」中看到它正在排隊等待成交。',
                cta: {
                    label: '去 OKX 下單體驗',
                    href: 'https://www.okx.com/trade-spot/btc-usdt',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c3',
                    title: '下單邏輯測驗',
                    description: '精明交易者的選擇',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣正在極速暴跌，你想趕快把手上的幣賣掉，這時候你應該用哪種單？',
                            options: [
                                { id: 'a', text: '限價單 (Limit)，慢慢排隊', isCorrect: false },
                                { id: 'b', text: '市價單 (Market)，立刻成交落袋為安', isCorrect: true },
                            ],
                            explanation: {
                                text: '在逃命或搶購的極端行情下，速度比價格重要。使用市價單可以確保你立即成交，避免因排隊而錯失出場時機導致虧損擴大。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c4',
                title: '槓桿與合約：雙面刃',
                blocks: [
                    {
                        type: 'text',
                        content: `### 別讓貪婪殺死你
槓桿 (Leverage) 就是借錢投資。開 10 倍槓桿，意味著你出 1 塊錢，交易所借你 9 塊錢。
*   **好處**：賺錢時，獲利放大 10 倍。
*   **壞處**：賠錢時，虧損也放大 10 倍。

### 什麼是爆倉 (Liquidation)？
如果你開 10 倍槓桿做多，只要價格下跌 10%，你的本金就會賠光。這時候交易所會強制賣掉你的倉位還錢，你的錢就歸零了。
這就是為什麼很多人玩合約玩到傾家蕩產。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '新手禁區 🚧',
                        content: '新手開槓桿**絕對不要超過 3 倍**。高槓桿 (20倍、50倍) 基本上跟去澳門賭場沒有分別，長期下來的期望值是負的。'
                    }
                ],
                practice: '不要真金白銀去試。使用交易所的「模擬盤」開一個 100 倍槓桿的單子，只要稍微波動一下，看看你的獲利/虧損跳動得有多快。感受那種心跳。',
                cta: {
                    label: '開啟模擬交易',
                    href: 'https://www.okx.com/trade-market/demo',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c4',
                    title: '風險計算題',
                    description: '算算看你會不會爆倉',
                    questions: [
                        {
                            id: 'q1',
                            type: 'calculation',
                            question: '如果你開了 50 倍槓桿做多比特幣。請問比特幣只要下跌多少百分比，你的本金就會歸零 (爆倉)？',
                            options: [
                                { id: 'a', text: '50%', isCorrect: false },
                                { id: 'b', text: '2%', isCorrect: true },
                                { id: 'c', text: '10%', isCorrect: false }
                            ],
                            explanation: {
                                text: '公式：100% / 槓桿倍數 = 可承受跌幅。100% / 50 = 2%。只要反向波動 2%，你的倉位就會瞬間蒸發。這就是高槓桿的恐怖之處。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c5',
                title: '網格交易：震盪行情的收租機器',
                blocks: [
                    {
                        type: 'text',
                        content: `### 睡覺也能幫你買賣
幣圈 80% 的時間都在盤整震盪。這時候最適合用的工具就是**網格交易 (Grid Trading)**。

原理很簡單：
只要設定一個價格區間 (例如 5萬 ~ 7萬)，機器人會自動幫你在**跌的時候分批買進**，**漲的時候分批賣出**。
你就變成了市場的「造市商」，不斷賺取微小的價差利潤。`
                    },
                    {
                        type: 'key-point',
                        title: '適用場景',
                        points: [
                            '市場沒有明顯方向（橫盤）時最好用。',
                            '如果市場出現單邊暴漲或暴跌，網格不管是賺還是賠，效率都會比直接持有現貨差。',
                            '把它當作是一種「收租」的工具，積少成多。'
                        ]
                    }
                ],
                practice: '找一個走勢很黏、上上下下的幣 (例如波動不大的主流幣)，去開一個小額的「現貨網格」單試跑三天，觀察它是如何幫你低買高賣的。',
                cta: {
                    label: '設定網格機器人',
                    href: 'https://www.okx.com/trade-strategy/spot-grid',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c5',
                    title: '機器人邏輯',
                    description: '理解自動化交易',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '網格交易機器人最怕遇到什麼樣的行情？',
                            options: [
                                { id: 'a', text: '上下震盪的盤整行情', isCorrect: false },
                                { id: 'b', text: '單邊暴漲或暴跌的趨勢行情', isCorrect: true },
                            ],
                            explanation: {
                                text: '網格靠震盪賺價差。如果遇到單邊暴漲，你會因為太早賣光而少賺；遇到單邊暴跌，你會接滿手刀子而被套牢。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c6',
                title: '止盈與止損：交易的安全帶',
                blocks: [
                    {
                        type: 'text',
                        content: `### 會買的是徒弟，會賣的才是師父
很多人賠大錢，不是因為看錯方向，而是因為**不願意認錯**。

*   **止損 (Stop Loss)**：當虧損達到一定程度 (例如 -10%)，系統自動幫你砍單出場。這是你的保命符，防止小傷變重傷。
*   **止盈 (Take Profit)**：當獲利達到目標，自動賣出鎖定利潤。防止「獲利回吐」，原本賺的變沒賺。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '心態調整',
                        content: '被止損是很正常的。專業交易員的勝率可能只有 40%，但他們透過嚴格的止損和讓獲利奔跑 (盈虧比)，最終依然能賺大錢。不要害怕止損，要害怕的是「不止損」。'
                    }
                ],
                practice: '下一次開單時，強迫自己一定要同時設定好「止損價」和「止盈價」。這不僅是保護資金，更是為了讓你晚上能睡得著覺。',
                cta: {
                    label: '學習如何設止損',
                    href: 'https://www.okx.com/learn/trading-strategy',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c6',
                    title: '風控觀念',
                    description: '活下來的關鍵',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '你開了一張單，結果行情不如預期，虧損已經到了你設定的止損位。這時候你心裡覺得「應該快反彈了」。你該怎麼做？',
                            options: [
                                { id: 'a', text: '取消止損，再凹一下單', isCorrect: false },
                                { id: 'b', text: '遵守紀律，觸發止損離場', isCorrect: true },
                            ],
                            explanation: {
                                text: '交易最忌諱的就是「凹單」。大部分的爆倉都是從「再凹一下」開始的。嚴格執行止損是活在這個市場的唯一法則。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-2',
        level: 2,
        title: '數據篇：像巨鯨一樣思考',
        description: '不要只看價格。學會看情緒、資金流與清算地圖。',
        icon: BarChart2,
        chapters: [
            {
                id: 'l2-c1',
                title: '恐慌貪婪指數 (FGI)：別人恐慌我貪婪？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 市場是情緒化的
巴菲特說：「在別人恐慌時貪婪，在別人貪婪時恐慌。」
但在幣圈，你要有數據佐證。

**FGI (Fear & Greed Index)** 分數 0 ~ 100：
*   **0 ~ 20 (極度恐慌)**：大家都在割肉逃跑，通常是**買點**。
*   **80 ~ 100 (極度貪婪)**：連你阿嬤都在問怎麼買幣，通常是**賣點**。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '怎麼用？',
                        content: '不要看到恐慌就無腦買 (可能還會更恐慌)。要搭配其他指標（如支撐位）一起看。'
                    }
                ],
                practice: '現在就去指標頁，看看今天的 FGI 是多少？市場現在處於什麼情緒？',
                cta: {
                    label: '查看即時 FGI 指數',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l2-c1',
                    title: 'FGI 實戰判讀',
                    description: '訓練逆向思考的能力',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '如果不考慮其他因素，當 FGI 來到 90 (極度貪婪) 時，較合理的策略是？',
                            options: [
                                { id: 'a', text: 'All in 追高，還會更漲', isCorrect: false },
                                { id: 'b', text: '分批止盈，落袋為安', isCorrect: true },
                                { id: 'c', text: '開高倍槓桿做多', isCorrect: false }
                            ],
                            explanation: {
                                text: '極度貪婪意味著市場過熱，隨時可能有回調風險。適度止盈是較安全的做法。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c2',
                title: '資金費率 (Funding Rate)：多空誰在付錢？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 這是合約市場的溫度計 🌡️
為了讓合約價格跟現貨價格不要差太多，交易所設計了「資金費率」機制。

*   **費率是正的 (+)**：做多的人太多，**多頭要付錢給空頭**。代表市場情緒**看漲**。
*   **費率是負的 (-)**：做空的人太多，**空頭要付錢給多頭**。代表市場情緒**看跌**。`
                    },
                    {
                        type: 'key-point',
                        title: '高階心法',
                        points: [
                            '如果費率**極度正** (例如年化 > 50%)，且價格漲不動了 -> **小心多頭踩踏，可能要崩盤**。',
                            '如果費率**極度負** (所有人都在做空)，且價格跌不下去了 -> **可能出現軋空 (Short Squeeze) 暴漲**。'
                        ]
                    }
                ],
                practice: '打開指標頁，檢查現在 BTC 的資金費率是正還是負？熱度如何？',
                cta: {
                    label: '查看資金費率熱圖',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l2-c2',
                    title: '資金費率判讀',
                    description: '看穿市場潛在的反轉信號',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '當比特幣價格在下跌，但資金費率卻呈現「極度負值」（大家都在做空），這時候要小心什麼？',
                            options: [
                                { id: 'a', text: '繼續暴跌', isCorrect: false },
                                { id: 'b', text: '軋空 (Short Squeeze) 反彈', isCorrect: true },
                                { id: 'c', text: '沒什麼特別的', isCorrect: false }
                            ],
                            explanation: {
                                text: '當過多人都做空，且空頭需要支付高額費率給多頭時，一旦價格稍微反彈，空頭被迫平倉買回，就會引發連鎖反應導致價格暴漲 (軋空)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c3',
                title: '多空比 (Long/Short Ratio)：散戶在哪？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 散戶反著做，別墅靠大海
大部分散戶都是虧錢的。所以我們只要**跟散戶反著做**，勝率通常很高。

**多空比 (L/S Ratio)**：這是一個反指標。
*   **多空比 > 1** (很多散戶在做多)：你需要**小心回調** (主力可能會來殺多頭)。
*   **多空比 < 1** (很多散戶在做空)：你需要**留意反彈** (主力可能會來殺空頭)。

**大戶多空比** 則是相反，要跟著大戶走。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '菁英觀點',
                        content: '通常我們看「多空人數比」。如果 70% 的人數都在做多，通常不是好事。'
                    }
                ],
                practice: '去 CoinGlass 或其他數據網站，查看 BTC 目前的多空人數比。是以散戶做多為主還是做空為主？',
                cta: {
                    label: '查看更多數據來源',
                    href: 'https://www.coinglass.com/LongShortRatio',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l2-c3',
                    title: '反指標測試',
                    description: '你站在哪一邊？',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當市場「多空人數比」高達 3.0 (代表極多散戶做多) 時，這通常被視為？',
                            options: [
                                { id: 'a', text: '看漲訊號', isCorrect: false },
                                { id: 'b', text: '看跌 (反指標) 訊號', isCorrect: true }
                            ],
                            explanation: {
                                text: '散戶通常是情緒化的追高。當過多散戶做多，市場車太重，主力往往會選擇向下洗盤。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c4',
                title: '清算地圖：莊家的獵殺清單',
                blocks: [
                    {
                        type: 'text',
                        content: `### 哪裡有流動性？
莊家 (主力) 資金量大，他們需要「對手盤」來成交。
哪裡有對手盤？**爆倉的地方**。

**清算地圖 (Liquidation Heatmap)** 顯示了哪裡堆積了大量的爆倉單。
*   如果上方 62,000 有 10 億美金的空單會爆倉 -> 價格很容易被吸過去。
*   價格就像磁鐵，會往流動性高 (爆倉密集) 的地方移動。`
                    },
                    {
                        type: 'key-point',
                        title: '操作策略',
                        points: [
                            '不要把止損設在**大眾止損位** (整數關卡)。',
                            '當價格去插針「清算區」後迅速反彈，通常是不錯的進場點 (假突破/假跌破)。'
                        ]
                    }
                ],
                practice: '搜尋 BTC Liquidation Heatmap，看看目前上方和下方的痛點在哪裡？',
                cta: {
                    label: '查看 Coinglass 清算圖',
                    href: 'https://www.coinglass.com/pro/futures/liquidation_heatmap',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l2-c4',
                    title: '獵殺心理學',
                    description: '避開被狩獵',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '價格為什麼經常會去「插針」觸碰清算密集區？',
                            options: [
                                { id: 'a', text: '純屬巧合', isCorrect: false },
                                { id: 'b', text: '主力為了獲取流動性 (Liquidity)', isCorrect: true },
                                { id: 'c', text: '因為系統故障', isCorrect: false }
                            ],
                            explanation: {
                                text: '在大額清算發生時，會有大量的市價單成交，這為大戶提供了完美的進場或出場流動性。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c5',
                title: '未平倉合約 (OI)：燃料有多少？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 派對還會繼續嗎？
**Open Interest (OI)** 代表目前場上有多少合約單還沒平倉。

*   **OI 上升 + 價格上漲**：新資金進場做多 -> **趨勢延續 (強勢)**。
*   **OI 下降 + 價格上漲**：空頭認賠回補 -> **動能減弱**。
*   **OI 暴跌**：大規模爆倉 (去槓桿) -> **行情反轉或震盪**。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '公式',
                        content: 'OI 越高 = 波動越大 (滿車都是火藥)。\nOI 越低 = 市場越冷靜。'
                    }
                ],
                practice: '觀察 BTC 的 OI 變化。通常在暴跌前夕，OI 都會處於歷史高位 (過度槓桿)。',
                cta: {
                    label: '查看 OI 數據',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l2-c5',
                    title: '動能分析',
                    description: '判斷趨勢強弱',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣價格創出新高，但此時 OI (持倉量) 卻在大幅下降。這暗示什麼？',
                            options: [
                                { id: 'a', text: '新資金瘋狂湧入', isCorrect: false },
                                { id: 'b', text: '趨勢可能快結束了 (空頭回補而非主動買盤)', isCorrect: true }
                            ],
                            explanation: {
                                text: '價漲量縮 (OI 縮)，通常代表上漲是由於空頭認賠平倉 (Short Covering) 造成的，而非新的多頭資金推動，趨勢往往難以持久。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c6',
                title: '成交量與市值佔比 (Dominance)',
                blocks: [
                    {
                        type: 'text',
                        content: `### 錢流去哪了？
幣圈的資金流動通常有規律 (Altcoin Season)：
1.  **比特幣獨強**：Bitcoin Dominance (BTC.D) 上升，山寨幣吸血下跌。
2.  **以太坊補漲**：BTC 橫盤，ETH 開始漲。
3.  **山寨季 (Alt Season)**：BTC.D 下降，資金溢出到小幣，群魔亂舞。
4.  **崩盤**：資金撤回 USDT。`
                    },
                    {
                        type: 'key-point',
                        title: '信號',
                        points: [
                            '**BTC.D > 50%**：持有比特幣最安全。',
                            '**BTC.D 開始高位回落**：可能是山寨季的訊號。'
                        ]
                    }
                ],
                practice: '去 TradingView 搜尋 `BTC.D`。現在的趨勢是向上還是向下？這決定了你該買大餅還是買山寨。',
                cta: {
                    label: '去 TradingView 看圖',
                    href: 'https://www.tradingview.com/chart/?symbol=CRYPTOCAP%3ABTC.D',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l2-c6',
                    title: '資金輪動測驗',
                    description: '掌握節奏',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當比特幣市佔率 (BTC.D) 正在飆升吸血時，這時候亂買山寨幣 (Altcoins) 通常會？',
                            options: [
                                { id: 'a', text: '跟著比特幣一起漲', isCorrect: false },
                                { id: 'b', text: '對比特幣匯率下跌 (跑輸大盤)', isCorrect: true }
                            ],
                            explanation: {
                                text: '資金是有限的。當資金集中流向比特幣時，山寨幣通常會因為流動性被抽走而表現疲軟。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-3',
        level: 3,
        title: '宏觀篇：跟著聯準會衝浪',
        description: '幣圈不是孤島。學會看 CPI、非農、FOMC 這些大浪。',
        icon: Calendar,
        chapters: [
            {
                id: 'l3-c1',
                title: '聯準會 (Fed)：全球金融的總司令',
                blocks: [
                    {
                        type: 'text',
                        content: `### 為什麼鮑爾 (Powell) 講話大家都在抖？
聯準會 (Fed) 是美國的央行，也是世界的央行。
它手上有兩個最強武器：**印鈔機** 和 **利率**。

*   **升息 (Rate Hike)**：把錢收回來。市場資金變少，風險資產 (股票、比特幣) 容易**下跌**。
*   **降息 (Rate Cut)**：把錢放出來。市場資金變多，風險資產容易**上漲**。`
                    },
                    {
                        type: 'key-point',
                        title: 'FOMC 會議',
                        points: [
                            '一年開 8 次會，決定要升息還是降息。',
                            '**點陣圖 (Dot Plot)**：預測未來的利率走勢。',
                            '不要跟聯準會作對 (Don\'t fight the Fed)。'
                        ]
                    }
                ],
                practice: '去財經日曆查看下一次 FOMC 會議的時間。通常在台灣時間週四凌晨 2:00。',
                cta: {
                    label: '查看財經日曆',
                    href: '/calendar',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c1',
                    title: '央行政策測驗',
                    description: '搞懂大趨勢',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當聯準會宣布「升息」時，理論上這對加密貨幣市場是？',
                            options: [
                                { id: 'a', text: '利多 (Bullish)', isCorrect: false },
                                { id: 'b', text: '利空 (Bearish)', isCorrect: true },
                            ],
                            explanation: {
                                text: '升息意味著資金成本變高，熱錢會回流銀行或美債，離開風險資產 (如比特幣)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c2',
                title: 'CPI 與通膨：錢變薄了嗎？',
                blocks: [
                    {
                        type: 'text',
                        content: `### CPI (消費者物價指數)
簡單說就是物價。東西變貴了 = 通膨。

*   **CPI 高於預期** 🔥：通膨嚴重 -> 聯準會 (Fed) 就要升息來壓制 -> 錢變貴了，熱錢撤出風險資產 -> **幣圈通常利空 (跌)**。
*   **CPI 低於預期** 🧊：通膨降溫 -> Fed 可能降息 -> 市場資金變多 -> **幣圈通常利多 (漲)**。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '交易策略',
                        content: '數據公布的那一瞬間，市場波動會非常劇烈（上下插針）。新手建議：**數據公布前後 15 分鐘，空手觀望**。不要去賭博。'
                    }
                ],
                practice: '去日曆 (Calendar) 看看下一次 CPI 公布是什麼時候？設定一個鬧鐘提醒自己。',
                cta: {
                    label: '查看財經日曆',
                    href: '/calendar',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c2',
                    title: '宏觀數據反應',
                    description: '理解經濟數據如何影響幣價',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '如果今晚公布的 CPI 大幅「高於」預期 (通膨比預期嚴重)，市場第一反應通常是？',
                            options: [
                                { id: 'a', text: '噴出大漲', isCorrect: false },
                                { id: 'b', text: '跳水下跌', isCorrect: true },
                                { id: 'c', text: '完全不動', isCorrect: false }
                            ],
                            explanation: {
                                text: '通膨高於預期 -> Fed 恐鷹派升息 -> 不利於風險資產 -> 下跌機率高。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c3',
                title: '非農就業 (NFP)：經濟好壞的風向球',
                blocks: [
                    {
                        type: 'text',
                        content: `### 美國人有沒有工作？
每個月第一個週五公布的 **非農就業數據 (Non-Farm Payrolls)**。

*   **就業強勁 (數據高)**：經濟太好 -> 通膨可能降不下來 -> Fed 不敢降息 -> **利空**。
*   **就業疲軟 (數據低)**：經濟衰退風險 -> Fed 可能要降息救市 -> **短多長空** (短期利好降息，長期擔心衰退)。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '壞消息就是好消息',
                        content: '在升息循環末端，市場往往期待「經濟變差」，因為這樣 Fed 才會降息。所以有時候看到就業數據爛，股市幣市反而大漲。'
                    }
                ],
                practice: '觀察本週五是否有 NFP 數據？注意晚間 20:30 (或 21:30) 的行情波動。',
                cta: {
                    label: '查看財經日曆',
                    href: '/calendar',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c3',
                    title: '非農邏輯題',
                    description: '市場邏輯很反直覺',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '在通膨嚴重時期，如果非農就業數據「超乎預期的好」(大家都有工作)，市場通常會如何解讀？',
                            options: [
                                { id: 'a', text: '經濟太好，不用擔心衰退，股市大漲', isCorrect: false },
                                { id: 'b', text: '經濟太熱，Fed 可能會繼續升息，利空', isCorrect: true }
                            ],
                            explanation: {
                                text: '在抗通膨階段，經濟過熱 (就業太好) 會讓 Fed 更有底氣繼續升息，這對投資市場是壓力。這就是所謂的「好消息就是壞消息」(Good news is bad news)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c4',
                title: '關聯性：美股與美元指數',
                blocks: [
                    {
                        type: 'text',
                        content: `### 幣圈不是孤島
比特幣現在跟美股 (特別是納斯達克) 的連動性越來越高。

*   **S&P 500 / Nasdaq**：**正相關**。美股漲，比特幣容易漲；美股崩，比特幣通常跟著崩。
*   **DXY (美元指數)**：**負相關**。美元太強 (DXY 漲)，代表資金流回美元，比特幣容易跌。美元弱 (DXY 跌)，比特幣容易漲。`
                    },
                    {
                        type: 'key-point',
                        title: '簡單判斷',
                        points: [
                            '美股開盤 (21:30) 後，比特幣波動會變大。',
                            '如果 DXY 突破 105，各國貨幣和資產都會承壓。'
                        ]
                    }
                ],
                practice: '去 TradingView 把 BTC 和 DXY 的K線圖疊在一起看，你會發現它們常常走反向。',
                cta: {
                    label: '查看 DXY 圖表',
                    href: 'https://www.tradingview.com/chart/?symbol=TVC%3ADXY',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l3-c4',
                    title: '連動性測驗',
                    description: '眼觀四面',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '通常情況下，比特幣與美元指數 (DXY) 的關係是？',
                            options: [
                                { id: 'a', text: '正相關 (一起漲)', isCorrect: false },
                                { id: 'b', text: '負相關 (翹翹板)', isCorrect: true },
                            ],
                            explanation: {
                                text: '美元強勢代表資金回流法幣，資產價格通常會下跌。美元弱勢代表資金外溢，資產價格(如黃金、比特幣)容易上漲。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c5',
                title: '週期：比特幣減半效應',
                blocks: [
                    {
                        type: 'text',
                        content: `### 四年一次的煙火
比特幣程式碼寫死了規則：每 21 萬個區塊 (約 4 年)，挖礦獎勵**減半**。
這意味著**供給減少**。如果需求不變，價格就會上漲。

*   **2012**：第一次減半 -> 2013 牛市
*   **2016**：第二次減半 -> 2017 牛市
*   **2020**：第三次減半 -> 2021 牛市
*   **2024**：第四次減半 -> ?`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '刻舟求劍',
                        content: '雖然歷史不一定重演，但減半週期是目前幣圈最強的共識 (Self-fulfilling Prophecy)。'
                    }
                ],
                practice: '去我們的「減半倒數」頁面，看看距離下次減半還剩多久？或者上一輪減半後多久破新高？',
                cta: {
                    label: '查看減半倒數',
                    href: '/halving',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c5',
                    title: '減半邏輯',
                    description: '供給與需求',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '比特幣減半 (Halving) 主要影響經濟模型中的哪一端？',
                            options: [
                                { id: 'a', text: '需求端 (買氣)', isCorrect: false },
                                { id: 'b', text: '供給端 (產量)', isCorrect: true },
                            ],
                            explanation: {
                                text: '減半直接減少了礦工每天能挖出的比特幣數量 (新增供給減半)。依照供需法則，供給減少有利於價格上漲。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c6',
                title: '流動性週期：M2 貨幣供給',
                blocks: [
                    {
                        type: 'text',
                        content: `### 水漲船高
比特幣本質上是**流動性的海綿**。
當全球央行都在「放水」(增加 M2 貨幣供給) 時，多出來的錢會流向高風險資產。

*   **Global M2 YOY 上升**：全球都在印錢 -> **比特幣大牛市**。
*   **Global M2 YOY 下降**：全球都在收水 -> **比特幣熊市**。

這比任何技術分析都更準確地預測了過去的大週期。`
                    },
                    {
                        type: 'key-point',
                        title: '觀察重點',
                        points: [
                            '關注中美兩大國的貨幣政策。',
                            '當你可以借到便宜的錢時，資產就會漲。'
                        ]
                    }
                ],
                practice: '搜尋 "Global Liquidity Index" 或 "M2 chart"，對照比特幣的月線圖，你會發現驚人的相似度。',
                cta: {
                    label: '深入研究宏觀流動性',
                    href: 'https://tw.tradingview.com/chart',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l3-c6',
                    title: '大局觀測驗',
                    description: '站在巨人的肩膀上',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '如果全球主要央行都開始啟動 QE (量化寬鬆) 印鈔票，這對比特幣的長期趨勢是？',
                            options: [
                                { id: 'a', text: '極度重大利多', isCorrect: true },
                                { id: 'b', text: '沒影響', isCorrect: false },
                                { id: 'c', text: '利空，因為錢變不值錢', isCorrect: false }
                            ],
                            explanation: {
                                text: '法幣變不值錢 (通膨) 正是比特幣 (抗通膨資產) 最強的催化劑。全球流動性氾濫是推動加密貨幣牛市的最根本動力。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-4',
        level: 4,
        title: '策略篇：建立你的交易系統',
        description: '不要憑感覺。學習 DCA、回測與歷史類比。',
        icon: LineChart,
        chapters: [
            {
                id: 'l4-c1',
                title: 'DCA 平均成本法：懶人投資術',
                blocks: [
                    {
                        type: 'text',
                        content: `### 猜底是神做的事，不是人做的
你永遠買不到最低點。
**DCA (Dollar-Cost Averaging)** 就是「定期定額」。
不管價格多少，每週固定買 100 U。

*   **跌的時候**：同樣的錢可以買到**更多顆**幣。
*   **漲的時候**：你的資產價值增加。

長期下來，你的持倉成本會被平均攤低。這是最適合大多數人的策略，尤其是對比特幣這種長期看漲的資產。`
                    }
                ],
                practice: '計算一下，如果你每個月薪水撥出 10% 做 DCA，一年後你會擁有多少比特幣？',
                cta: {
                    label: '去 OKX 設定定期定額',
                    href: 'https://www.okx.com/buy-crypto',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l4-c1',
                    title: 'DCA 觀念驗證',
                    description: '為什麼說時間是你的朋友',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: 'DCA 策略的主要優勢是什麼？',
                            options: [
                                { id: 'a', text: '可以買在最低點', isCorrect: false },
                                { id: 'b', text: '可以一夜致富', isCorrect: false },
                                { id: 'c', text: '克服人性弱點，平均分攤成本', isCorrect: true }
                            ],
                            explanation: {
                                text: 'DCA 讓你不需要盯盤、不需要猜測市場時機，透過紀律來克服追高殺低的人性弱點。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c2',
                title: '市場結構：看懂趨勢的 N 字型',
                blocks: [
                    {
                        type: 'text',
                        content: `### 趨勢是有慣性的 (Trends)
市場不會直上直下，而是像爬樓梯。

*   **多頭 (Uptrend)**：高點越來越高 (HH)，低點也越來越高 (HL)。
    *   策略：拉回找買點 (Buy the Dip)。
*   **空頭 (Downtrend)**：低點越來越低 (LL)，高點也越來越低 (LH)。
    *   策略：反彈找賣點 (Sell the Rally)。

只要結構沒破壞 (例如多頭跌破前低)，趨勢就還在。不要隨便猜頂猜底。`
                    },
                    {
                        type: 'key-point',
                        title: '口訣',
                        points: [
                            '順勢而為 (Trend is your friend)。',
                            '不要在多頭趨勢裡做空，不要在空頭趨勢裡抄底。'
                        ]
                    }
                ],
                practice: '隨便打開一張比特幣日線圖，試著標記出最近的一個「更高的高點 (HH)」和「更高的低點 (HL)」。',
                cta: {
                    label: '去 TradingView 畫圖',
                    href: 'https://tw.tradingview.com/chart',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l4-c2',
                    title: '趨勢判斷力',
                    description: '別逆向行駛',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣價格在下跌後開始反彈，但反彈的高點「沒有超過」前一個高點，隨後又繼續下跌。這代表？',
                            options: [
                                { id: 'a', text: '趨勢反轉向上', isCorrect: false },
                                { id: 'b', text: '空頭結構 (Lower High) 確認，趨勢向下', isCorrect: true },
                            ],
                            explanation: {
                                text: '這是典型的空頭結構特徵：Lower High (LH) 和 Lower Low (LL)。多頭無力創新高，空頭主導市場。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c3',
                title: '指標應用：RSI 與背離',
                blocks: [
                    {
                        type: 'text',
                        content: `### 不要過度依賴指標
指標是落後的，價格才是即時的。
但有一個信號勝率很高：**背離 (Divergence)**。

*   **頂背離 (看跌)**：價格創新高，但 RSI 指標沒創新高 (力量跟不上)。 -> **準備下跌**。
*   **底背離 (看漲)**：價格創新低，但 RSI 指標沒創新低 (跌不動了)。 -> **準備反彈**。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: 'RSI 超買超賣',
                        content: 'RSI > 70 叫超買，但牛市時可以一直超買 (鈍化)。所以不要看到 > 70 就做空，會被嘎死。'
                    }
                ],
                practice: '去查看我們開發的「背離篩選器」，看看現在有哪些幣出現了頂背離或底背離信號？',
                cta: {
                    label: '查看背離信號',
                    href: '/indicators/divergence',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l4-c3',
                    title: '技術分析測驗',
                    description: '找出潛在反轉點',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '價格一直在創新高，但是 RSI 指標的高點卻一次比一次低。這叫做什麼？',
                            options: [
                                { id: 'a', text: '頂背離 (Bearish Divergence)，暗示可能下跌', isCorrect: true },
                                { id: 'b', text: '底背離 (Bullish Divergence)，暗示可能上漲', isCorrect: false },
                                { id: 'c', text: '常態分佈', isCorrect: false }
                            ],
                            explanation: {
                                text: '價格上漲但動能減弱 (RSI 下降)，代表買盤力道衰竭，是常見的趨勢反轉訊號。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c4',
                title: '支撐與壓力：供需的戰場',
                blocks: [
                    {
                        type: 'text',
                        content: `### 哪裡有人想買？哪裡有人想賣？
K線圖上的每一個轉折點，都代表有人在那裡大規模買進或賣出。

*   **支撐位 (Support)**：地板。價格跌到這裡會有買盤撐住。
*   **壓力位 (Resistance)**：天花板。價格漲到這裡會有賣壓打下來。

**支撐與壓力互換**：如果天花板被突破了，下次跌回來，天花板就會變成地板 (支撐)。`
                    },
                    {
                        type: 'key-point',
                        title: '交易策略',
                        points: [
                            '**回到支撐做多** (配合止損)。',
                            '**遇到壓力止盈** (不要去賭突破)。',
                            '如果壓力區被「大陽線」突破，等它回踩測試不破時，是最好的買點。'
                        ]
                    }
                ],
                practice: '試著在圖表上畫出比特幣目前的「壓力位」在哪裡？如果突破了，下一個目標價多少？',
                cta: {
                    label: '去 OKX 圖表畫線',
                    href: 'https://www.okx.com/trade-spot/btc-usdt',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l4-c4',
                    title: '關鍵價位判斷',
                    description: '尋找最佳進場點',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當一個強力的「壓力位」(天花板) 被價格有效突破後，這個價位通常會轉變為？',
                            options: [
                                { id: 'a', text: '沒什麼意義', isCorrect: false },
                                { id: 'b', text: '支撐位 (地板)', isCorrect: true },
                            ],
                            explanation: {
                                text: '突破後，原本的賣家停損出場或轉為看多，未上車的買家會在回調時進場，因此壓力會轉為支撐 (Support Resistance Flip)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c5',
                title: '風險管理：怎麼輸都不怕',
                blocks: [
                    {
                        type: 'text',
                        content: `### 這是賭博與投資的唯一區別
你不需要預測未來，你只需要管好風險。

1.  **止損 (Stop Loss)**：進場前就要決定「如果我看錯，我願意賠多少」。這筆錢是你的入場費，不是意外。
2.  **倉位管理 (Position Sizing)**：不要 All in。
    *   **2% 法則**：任何一筆交易，虧損不應該超過總資金的 2%。
    *   即使你連輸 10 次，你還剩下 80% 的本金，還有機會翻身。如果是 All in，輸一次就畢業了。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '絕對紀律',
                        content: '到了止損位，無條件砍單。最常見的悲劇就是：「再凹一下就會回來了...」，結果從虧 5% 變成虧 80%。'
                    }
                ],
                practice: '計算題：你有 1000 U 本金。你想買入比特幣，止損設在 5%。請問為了遵守「單筆虧損不超過總資金 2%」的規則，你最多能買多少 U 的比特幣？ (答案：400 U)',
                cta: {
                    label: '使用凱利公式計算機',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l4-c5',
                    title: '風控數學題',
                    description: '活下來才能致富',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '你的總資金有 10,000 U。你計畫做一筆交易，止損距離現價 10%。如果你想控制這筆交易最多只賠掉總資金的 1% (100 U)，你的倉位大小 (Position Size) 應該是多少？',
                            options: [
                                { id: 'a', text: '10,000 U (All in)', isCorrect: false },
                                { id: 'b', text: '1,000 U', isCorrect: true },
                                { id: 'c', text: '100 U', isCorrect: false }
                            ],
                            explanation: {
                                text: '倉位 x 10% (止損幅度) = 100 U (風險金額)。所以倉位 = 100 / 0.1 = 1,000 U。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c6',
                title: '交易日誌：進步的唯一捷徑',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你為什麼要開這單？
如果你說不出來，那你就是在賭博。
每一筆交易都要記錄：
1.  **進場理由**：RSI 背離？支撐反彈？
2.  **止損止盈**：設在哪？
3.  **檢討**：這筆賺了還是賠了？為什麼？有沒有遵守紀律？

只要你每天**複盤 (Review)** 自己的交易，半年後你會發現自己跟神一樣強。`
                    },
                    {
                        type: 'key-point',
                        title: '工具',
                        points: [
                            'Excel / Notion 是好朋友。',
                            '誠實面對自己的錯誤 (凹單、Fomo、手賤)，不要騙自己。'
                        ]
                    }
                ],
                practice: '從今天開始，建立一個簡單的 Notion 頁面，記錄你的接下來 5 筆模擬交易。',
                cta: {
                    label: '下載交易日誌範本',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l4-c6',
                    title: '自我修煉',
                    description: '通往職業之路',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '為什麼即使是虧損的交易，也具有極高的價值？',
                            options: [
                                { id: 'a', text: '虧錢能訓練抗壓性', isCorrect: false },
                                { id: 'b', text: '因為它暴露了你的系統漏洞或心理弱點，檢討後能避免下次再犯', isCorrect: true },
                            ],
                            explanation: {
                                text: '每一筆虧損都是市場給你的學費。如果你沒學到教訓，那這筆學費就白繳了。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-5',
        level: 5,
        title: '心法篇：倖存者法則',
        description: '在這個市場活下來，比什麼都重要。風險管理是唯一聖杯。',
        icon: Shield,
        chapters: [
            {
                id: 'l5-c1',
                title: 'FOMO 與 FUD：情緒的魁儡',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你的大腦在騙你
*   **FOMO (Fear Of Missing Out)**：看到別人賺錢，覺得自己虧了，忍不住在山頂追高。
*   **FUD (Fear, Uncertainty, Doubt)**：看到鬼故事 (監管、駭客)，嚇到在谷底割肉。

市場專門收割情緒化的人。主力就是利用 FOMO 叫你接盤，利用 FUD 騙你交出籌碼。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '解藥',
                        content: '當你覺得「興奮到睡不著」時，賣出。當你覺得「絕望到想刪 App」時，買入。'
                    }
                ],
                practice: '回想一下你上次虧損的交易。是不是因為 FOMO 追高，還是因為恐慌割肉？',
                cta: {
                    label: '閱讀更多交易心理學',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c1',
                    title: '情緒檢測',
                    description: '誰在控制你的滑鼠？',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '當你在社群媒體上看到每個人都在曬 10 倍的獲利截圖，你這時候感到焦慮並想立刻進場。這叫做？',
                            options: [
                                { id: 'a', text: '洞察先機', isCorrect: false },
                                { id: 'b', text: 'FOMO (錯失恐懼症)', isCorrect: true },
                            ],
                            explanation: {
                                text: '這是典型的 FOMO。通常當大家都在曬單時，行情已經接近尾聲，進場往往是接盤。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c2',
                title: '賭徒謬誤：這次一定會開大',
                blocks: [
                    {
                        type: 'text',
                        content: `### 獨立事件的陷阱
如果你丟硬幣連續 10 次正面，第 11 次出現反面的機率是多少？
很多人覺得「一定是反面了吧？」。
**錯，還是 50%。**

*   不要覺得「跌這麼多了，一定要漲了吧」。
*   不要覺得「漲這麼多了，一定要跌了吧」。

市場沒有記憶，價格只反映當下的供需。`
                    },
                    {
                        type: 'key-point',
                        title: '心法',
                        points: [
                            '不要抄底：地板下面還有地下室，地下室下面還有十八層地獄。',
                            '順勢交易：如果連續漲 10 天，第 11 天漲的機率可能反而更高 (動能)。'
                        ]
                    }
                ],
                practice: '去看看 LUNA 歸零的K線圖。在它從 100 跌到 1 的過程中，無數人覺得「跌夠了吧」進去抄底，結果全部歸零。',
                cta: {
                    label: '查看 LUNA 歷史走勢',
                    href: 'https://tw.tradingview.com/chart',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l5-c2',
                    title: '機率陷阱',
                    description: '相信數學，別相信直覺',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣連續下跌了 7 天。你認為今天「肯定」會漲，因為不可能一直跌。這種想法犯了什麼錯誤？',
                            options: [
                                { id: 'a', text: '賭徒謬誤 (Gambler\'s Fallacy)', isCorrect: true },
                                { id: 'b', text: '倖存者偏差', isCorrect: false },
                            ],
                            explanation: {
                                text: '你認為過去的結果會影響未來的獨立事件。事實上，跌了 7 天不代表第 8 天就會漲，趨勢可能會延續。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c3',
                title: '沈沒成本：為什麼你砍不下手？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 已經賠掉的錢，不是你的錢
你有得過「不賣就不算賠」的病嗎？
這叫 **沈沒成本謬誤 (Sunk Cost Fallacy)**。

你因為不捨得已經賠掉的 10%，結果最後賠掉 90%。
以前賠多少不重要，重要的是：**「如果現在持有現金，你還會買這支幣嗎？」**
如果不會，那就賣掉。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '換倉思維',
                        content: '把爛幣賣掉，換到強勢幣。同樣是虧損狀態，但強勢幣回本的機率遠大於爛幣。'
                    }
                ],
                practice: '打開你的持倉，檢視有沒有虧損超過 50% 的幣？問自己：「如果我現在空手，我會買它嗎？」如果不會，執行清倉。',
                cta: {
                    label: '前往我的投資組合',
                    href: '/profile',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c3',
                    title: '斷捨離測驗',
                    description: '理性決策',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '面對虧損的部位，最理性的決策依據不僅是「回本」，而是？',
                            options: [
                                { id: 'a', text: '禱告', isCorrect: false },
                                { id: 'b', text: '資金效率 (Opportunity Cost)', isCorrect: true },
                            ],
                            explanation: {
                                text: '死守爛倉位會讓你錯過其他賺錢的機會 (機會成本)。理性做法是將資金移到勝率更高的地方。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c4',
                title: '倖存者偏差：死人不會說話',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你只看到賺錢的人
你看到有人買土狗幣賺了 100 倍。
你沒看到的是，有 10000 個人買土狗幣歸零了。
這叫 **倖存者偏差 (Survivorship Bias)**。

社群媒體上充滿了倖存者。不要因為別人的幸運，而忽略了背後的巨大風險。
模仿倖存者的結果，通常是成為分母。`
                    },
                    {
                        type: 'key-point',
                        title: '真相',
                        points: [
                            '大V曬單通常只曬賺的，賠的你看不到。',
                            '不要羨慕買彩券中獎的人，去算算期望值。'
                        ]
                    }
                ],
                practice: '在這個市場上，每出現一個暴富神話，背後大約有多少個破產故事？ (大概是 1:10000)',
                cta: {
                    label: '了解更多偏差',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c4',
                    title: '盲點測試',
                    description: '看見看不見的',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '網路上有很多「合約大神」勝率 100%。你應該怎麼看？',
                            options: [
                                { id: 'a', text: '拜他為師，跟單發財', isCorrect: false },
                                { id: 'b', text: '懷疑是倖存者偏差或造假 (P圖)', isCorrect: true },
                            ],
                            explanation: {
                                text: '長期勝率 100% 幾乎不可能。這通常是只展示獲利單 (倖存者) 或單純詐騙。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c5',
                title: '稟賦效應：跟你的幣談戀愛',
                blocks: [
                    {
                        type: 'text',
                        content: `### 自己的孩子最可愛
一旦你買入了一個幣，你就會下意識地覺得它「比較好」，並且只看它的好消息，過濾掉壞消息。
這叫 **稟賦效應 (Endowment Effect)**。

不要跟你的幣談戀愛。它只是一個代碼。
該賣就賣，該換就換。做一個無情的渣男。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '同溫層',
                        content: 'Telegram 群組最容易強化這種效應。大家互相洗腦 (CX)，最後一起抱著歸零。'
                    }
                ],
                practice: '試著列出你持倉佔比最大的幣的 3 個「缺點」或「風險」。如果你列不出來，你可能已經戀愛了。',
                cta: {
                    label: '客觀分析工具',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c5',
                    title: '客觀性測驗',
                    description: '保持中立',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '當有人批評你持有的幣是「垃圾」時，你感到非常生氣並想反駁。這可能代表？',
                            options: [
                                { id: 'a', text: '你非常有正義感', isCorrect: false },
                                { id: 'b', text: '你陷入了稟賦效應，過度情感投入', isCorrect: true },
                            ],
                            explanation: {
                                text: '投資應該是理性的。對批評感到憤怒通常是因為將資產視為自我的一部分 (Empowerment Effect)，這是危險的信號。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c6',
                title: '生存法則：比氣長',
                blocks: [
                    {
                        type: 'text',
                        content: `### 活著，就是勝利
巴菲特 99% 的財富都是 50 歲以後賺到的。
複利需要時間。

但在幣圈，90% 的人第一年就畢業了 (爆倉、被駭、詐騙)。
你的首要目標不是「賺多少」，而是**「不要死」**。

*   不開高槓桿。
*   不碰看不懂的項目。
*   做好錢包隔離。`
                    },
                    {
                        type: 'key-point',
                        title: '終極目標',
                        points: [
                            '留在牌桌上。',
                            '只要你還在場內，機會永遠都有。',
                            '財富是耐心的變現。'
                        ]
                    }
                ],
                practice: '寫下你的「生存宣言」：我承諾不使用超過 5 倍槓桿，不隨意授權錢包，以此確保我明年還在這個市場。',
                cta: {
                    label: '回到首頁',
                    href: '/',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c6',
                    title: '畢業考',
                    description: '最重要的一課',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '投資加密貨幣，最重要的第一原則是什麼？',
                            options: [
                                { id: 'a', text: '尋找百倍幣', isCorrect: false },
                                { id: 'b', text: '本金安全 (生存)', isCorrect: true },
                                { id: 'c', text: '全倉梭哈', isCorrect: false }
                            ],
                            explanation: {
                                text: '本金沒了，遊戲就結束了。活下來，才有輸贏。勝者往往是活得最久的人，而不是跑得最快的人。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-6',
        level: 6,
        title: 'Final Boss：實戰畢業考',
        description: '綜合應用所有知識，證明你不再是韭菜。通過後將獲得認證徽章。',
        icon: Trophy,
        chapters: [
            {
                id: 'l6-final',
                title: '畢業考：模擬情境挑戰',
                blocks: [
                    {
                        type: 'text',
                        content: `### 恭喜你走到這裡 🎓
你已經學會了：
*   **Web3 基礎**：錢包與資產安全。
*   **交易所操作**：出入金、現貨與合約。
*   **市場數據**：FGI、資金費率、多空比。
*   **宏觀經濟**：Fed、CPI、流動性週期。
*   **技術策略**：趨勢判斷、支撐壓力、DCA。
*   **交易心理**：克服 FOMO、生存法則。

現在，是時候面對最終考驗了。
這個測驗包含 10 題高難度情境題。
這不是考記憶力，而是考**判斷力**。
祝你好運。`
                    }
                ],
                practice: '深呼吸，這不是演習。準備好你的知識與直覺。',
                cta: {
                    label: '🔥 開始最終挑戰 (Get Certified)',
                    href: '#start-final-quiz',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-final',
                    title: 'CryptoTW 認證交易員資格考',
                    description: '證明你不是韭菜',
                    rewardBadge: 'pro-trader',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '【資產安全】你收到一封 Email 說你的 Metamask 錢包即將被凍結，請點擊連結進行驗證。看起來非常官方，且網址跟真的幾乎一樣。你該怎麼做？',
                            options: [
                                { id: 'a', text: '立刻點進去輸入助記詞解鎖', isCorrect: false },
                                { id: 'b', text: '忽視它。去中心化錢包沒有人能凍結，官方也絕不會要你的助記詞', isCorrect: true },
                                { id: 'c', text: '回信詢問客服確認真偽', isCorrect: false }
                            ],
                            explanation: {
                                text: '這是典型的釣魚詐騙。區塊鏈是非託管的，沒有「官方凍結」這回事。任何索要助記詞的都是詐騙。',
                            }
                        },
                        {
                            id: 'q2',
                            type: 'scenario',
                            question: '【交易策略】比特币剛創下歷史新高 (ATH)，所有媒體都在報導，你的朋友也都問你怎麼買。FGI 指數顯示 95。這時候最危險的動作是？',
                            options: [
                                { id: 'a', text: '分批止盈出場', isCorrect: false },
                                { id: 'b', text: '繼續持有現貨不動', isCorrect: false },
                                { id: 'c', text: '因為怕錯過更高點，開 50 倍槓桿追多', isCorrect: true }
                            ],
                            explanation: {
                                text: '在極度貪婪的情緒下開高槓桿追多，是賠錢最快的方式。一旦行情小幅回調 (去槓桿)，你會立刻爆倉。',
                            }
                        },
                        {
                            id: 'q3',
                            type: 'scenario',
                            question: '【宏觀判斷】聯準會 (Fed) 突然宣布緊急降息 2 碼 (0.5%)，但股市和幣市卻大跌。這最可能是因為與降息同時發生了什麼？',
                            options: [
                                { id: 'a', text: '市場認為降息幅度不夠', isCorrect: false },
                                { id: 'b', text: '市場解讀為「經濟衰退」恐慌，而非資金寬鬆利多', isCorrect: true },
                                { id: 'c', text: '大家錢太多沒地方花', isCorrect: false }
                            ],
                            explanation: {
                                text: '緊急大幅降息通常意味著經濟出了大問題 (衰退)。雖然長期資金變多，但短期恐慌會導致拋售 (衰退交易)。',
                            }
                        },
                        {
                            id: 'q4',
                            type: 'calculation',
                            question: '【風控計算】你有 10,000 U 本金。你想要嚴格執行「單筆虧損不超過 2%」的紀律。若你這次交易的止損空間是 10%，請問你可以開多大的倉位？',
                            options: [
                                { id: 'a', text: '2,000 U', isCorrect: true },
                                { id: 'b', text: '10,000 U', isCorrect: false },
                                { id: 'c', text: '200 U', isCorrect: false }
                            ],
                            explanation: {
                                text: '最大容許虧損 = 10,000 x 2% = 200 U。倉位 x 10% = 200 U。倉位 = 2,000 U。',
                            }
                        },
                        {
                            id: 'q5',
                            type: 'scenario',
                            question: '【數據解讀】你發現某個小幣的合約持倉量 (OI) 暴增，且資金費率變成 -0.1%。同時價格並沒有下跌，反而硬撐在支撐位。這可能是在醞釀？',
                            options: [
                                { id: 'a', text: '空頭陷阱 + 軋空 (Short Squeeze)', isCorrect: true },
                                { id: 'b', text: '多頭出貨', isCorrect: false },
                                { id: 'c', text: '沒人玩了', isCorrect: false }
                            ],
                            explanation: {
                                text: 'OI 增 + 費率負 + 跌不下去 = 很多人在做空，但主力在吸籌接盤。一旦拉盤，空頭會被迫平倉推升幣價，形成軋空。',
                            }
                        },
                        {
                            id: 'q6',
                            type: 'scenario',
                            question: '【心態控制】你剛賣掉一支幣，結果它馬上爆漲 50%。你感到非常痛苦，覺得自己是白癡。這時候最不該做的事情是？',
                            options: [
                                { id: 'a', text: '把電腦關掉，去運動', isCorrect: false },
                                { id: 'b', text: '立刻市價全倉追回來，發誓要賺到這波', isCorrect: true },
                                { id: 'c', text: '檢討賣出的理由是否合理', isCorrect: false }
                            ],
                            explanation: {
                                text: '這叫「報復性交易」或 FOMO 追高。通常心態崩了的操作勝率極低，且容易買在最高點 (山頂)。',
                            }
                        },
                        {
                            id: 'q7',
                            type: 'scenario',
                            question: '【技術分析】RSI 出現了「底背離」(價格創新低，RSI 墊高)，同時價格來到了週線級別的強力支撐區。這是一個？',
                            options: [
                                { id: 'a', text: '高勝率的做多 setup', isCorrect: true },
                                { id: 'b', text: '絕對會漲的訊號', isCorrect: false },
                                { id: 'c', text: '做空的訊號', isCorrect: false }
                            ],
                            explanation: {
                                text: '技術指標 + 關鍵價位 (共振)，是交易勝率最高的時刻。但記住，沒有絕對，仍需設止損。',
                            }
                        },
                        {
                            id: 'q8',
                            type: 'scenario',
                            question: '【交易所常識】為什麼在用網格機器人 (Grid Bot) 時，最怕遇到「單邊行情」？',
                            options: [
                                { id: 'a', text: '因為機器人會壞掉', isCorrect: false },
                                { id: 'b', text: '因為會導致「賣飛」(漲破區間) 或「套牢」(跌破區間)', isCorrect: true },
                            ],
                            explanation: {
                                text: '網格適合震盪。單邊上漲你會把幣越賣越少 (賣飛)，單邊下跌你會把U越買越少 (接刀子套牢)。',
                            }
                        },
                        {
                            id: 'q9',
                            type: 'scenario',
                            question: '【詐騙防範】有人私訊你，說有一個「套利機器人」每天穩賺 1%，只要把 USDT 轉到這個合約地址授權即可。他的群組裡有很多人都說賺翻了。這是？',
                            options: [
                                { id: 'a', text: '千載難逢的機會', isCorrect: false },
                                { id: 'b', text: '典型的龐氏騙局 (Ponzi) 或 盜取授權', isCorrect: true },
                            ],
                            explanation: {
                                text: '每天 1% = 年化 3650%，巴菲特都不敢想。這通常是龐氏騙局 (後金補前金) 或直接騙取你的錢包授權轉走所有資產。',
                            }
                        },
                        {
                            id: 'q10',
                            type: 'scenario',
                            question: '【終極哲學】在加密貨幣市場，什麼樣的人能活得最久，賺到大錢？',
                            options: [
                                { id: 'a', text: '最聰明、智商最高的人', isCorrect: false },
                                { id: 'b', text: '敢開最大的槓桿、最有種的人', isCorrect: false },
                                { id: 'c', text: '有耐心、懂風控、不隨情緒起舞的人', isCorrect: true }
                            ],
                            explanation: {
                                text: 'Crypto 專治各種不服。只有敬畏市場、嚴格風控、有耐心等待週期的人 (HODLer & Disciplined Trader)，才能笑到最後。',
                            }
                        }
                    ]
                }
            }
        ]
    }
]

export function getLearnerLevel(completedChapters: Set<string> | string[]): { level: number, title: string, color: string } {
    const completed = new Set(completedChapters)
    const count = completed.size

    // Simple logic based on count for now, perfect logic would check specific chapter IDs
    // Total chapters approx 12-15

    if (count >= 10) return { level: 3, title: '幣圈老司機', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' }
    if (count >= 5) return { level: 2, title: '數據分析師', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' }
    if (count >= 1) return { level: 1, title: '交易所學徒', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }

    return { level: 0, title: '新手韭菜', color: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20' }
}
