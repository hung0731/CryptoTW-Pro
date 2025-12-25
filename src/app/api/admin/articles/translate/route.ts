import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// 使用 Gemini 3 Flash 模型
const TRANSLATE_MODEL = 'gemini-3-flash-preview';

// 固定分類定義
const ARTICLE_CATEGORIES = {
    market_analysis: {
        key: 'market_analysis',
        label: '市場分析',
        description: '短期價格走勢、技術分析、交易策略分析'
    },
    onchain_data: {
        key: 'onchain_data',
        label: '鏈上數據',
        description: 'Glassnode、CryptoQuant 等鏈上指標分析'
    },
    macro_economy: {
        key: 'macro_economy',
        label: '總體經濟',
        description: '利率、通膨、Fed 政策、全球經濟對加密市場影響'
    },
    project_research: {
        key: 'project_research',
        label: '項目研究',
        description: '特定區塊鏈項目、協議、代幣的深度分析'
    },
    industry_report: {
        key: 'industry_report',
        label: '產業報告',
        description: 'DeFi、NFT、Layer2 等產業趨勢報告'
    }
} as const;

const TRANSLATION_PROMPT = `
你是「加密台灣 Pro」的資深翻譯編輯，專門翻譯國外頂級加密貨幣研究報告（如 Glassnode、Messari、Delphi Digital、The Block）。

【核心任務】
將以下外國加密貨幣分析報告翻譯成專業的繁體中文（台灣用語），同時保持原文的分析深度與專業性。

【翻譯品質標準】
1. **準確性**：完整保留原文的數據、觀點、結論，不添加、不刪減、不曲解
2. **專業性**：使用台灣金融與幣圈專業術語，語氣像《財訊》或彭博終端機
3. **可讀性**：句子通順，避免機翻感，讓讀者感覺是中文原創內容

【台灣用語規範 - 必須遵守】
✅ 正確用法：
- 「美元」非「美金」
- 「回調」非「回撤」
- 「帳戶」非「賬戶」
- 「槓桿」非「杠杆」
- 「交易所」非「交易平台」（除非指 DEX）
- 「清算」或「爆倉」非「穿倉」
- 「費率」非「費用率」
- 「多空比」非「多空比率」
- 「減半」非「減產」
- 「挖礦」非「開採」
- 「錢包」非「皮夾」
- 「幣安」「Coinbase」「OKX」等交易所名稱保持通用寫法

❌ 禁止使用中國大陸用語：
- 「回撤」→ 改用「回調」
- 「走強」「走弱」→ 改用「轉強」「轉弱」
- 「承壓」→ 改用「面臨壓力」
- 「利好」「利空」→ 改用「利多」「利空」
- 「看多」「做多」OK，但「多頭」更專業

【專業術語處理】
保留英文原文（首次出現可加註中文）：
- On-chain、DeFi、TVL、Funding Rate、Open Interest、OI
- MVRV、SOPR、STH/LTH、Realized Price
- ETF、SEC、Fed、FOMC
- Layer 1、Layer 2、Rollup
- Smart Money、Whale、Top Traders

【分類判斷 - 必須從以下 5 類中選擇一個】
1. "market_analysis" = 市場分析（短期價格走勢、技術分析、交易策略）
2. "onchain_data" = 鏈上數據（Glassnode、CryptoQuant 等鏈上指標分析）
3. "macro_economy" = 總體經濟（利率、通膨、Fed 政策、全球經濟）
4. "project_research" = 項目研究（特定區塊鏈項目、協議、代幣深度分析）
5. "industry_report" = 產業報告（DeFi、NFT、Layer2 等產業趨勢）

根據文章主題選擇最相關的分類。

【格式規範】
1. **標題**：15-25 字，精煉且吸引人，像新聞標題
   - ✅ 好例子：「比特幣長期持有者惜售，鏈上數據顯示底部訊號」
   - ❌ 壞例子：「關於比特幣鏈上數據的分析報告」
   
2. **摘要**：50-80 字，涵蓋核心論點，讓讀者 10 秒內掌握重點
   
3. **內容**：
   - 使用 Markdown 格式
   - 保留原文段落結構
   - 數據圖表引用保留（如「見圖 1」）
   - 重要數據加粗（如 **$95,000**）
   - 適當使用小標題分段

4. **標籤**：3-5 個中文標籤，選擇最相關的
   - 範例：比特幣、鏈上分析、ETF、減半、總經

【思考流程】
Step 1：通讀全文，理解核心論點
Step 2：判斷文章屬於哪個分類
Step 3：逐段翻譯，確保專業術語正確
Step 4：潤飾全文，確保讀起來像中文原創
Step 5：生成標題與摘要
Step 6：輸出 JSON

【輸出格式】只輸出 JSON，不要有其他文字
{
  "title": "中文標題",
  "summary": "50-80字摘要",
  "content": "完整 Markdown 內容",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "category": "market_analysis|onchain_data|macro_economy|project_research|industry_report",
  "reading_time_minutes": 閱讀時間數字
}

【原文內容】
`;

interface TranslateRequest {
    source_url: string;
    source_name: string;
    source_author?: string;
    source_published_at?: string;
    raw_content: string;
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const body: TranslateRequest = await request.json();
        const { source_url, source_name, source_author, source_published_at, raw_content } = body;

        if (!raw_content || !source_url || !source_name) {
            return NextResponse.json({
                error: 'Missing required fields: raw_content, source_url, source_name'
            }, { status: 400 });
        }

        // Limit content length for API
        const truncatedContent = raw_content.slice(0, 15000);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: TRANSLATE_MODEL });

        const prompt = TRANSLATION_PROMPT + truncatedContent;

        logger.info('Starting AI translation', {
            feature: 'articles-translate',
            source_name,
            content_length: raw_content.length
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON from response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            logger.error('Failed to parse AI response', { feature: 'articles-translate' });
            return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
        }

        const translatedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

        // Generate slug from title
        const slug = translatedData.title
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50) + '-' + Date.now().toString(36);

        // Return complete article object ready for saving
        const articleData = {
            title: translatedData.title,
            slug,
            summary: translatedData.summary,
            content: translatedData.content,
            category: translatedData.category || 'analysis',
            tags: translatedData.tags || [],
            reading_time_minutes: translatedData.reading_time_minutes || 5,

            // Source attribution
            source_name,
            source_url,
            source_author: source_author || null,
            source_published_at: source_published_at || null,

            // Defaults
            is_published: false,
            is_featured: false
        };

        logger.info('AI translation completed', {
            feature: 'articles-translate',
            title: articleData.title
        });

        return NextResponse.json({
            success: true,
            article: articleData
        });

    } catch (error) {
        logger.error('Error in AI translation', error, { feature: 'articles-translate' });
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}
