import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const IMPORT_MODEL = 'gemini-2.5-flash-preview-09-2025';

const IMPORT_PROMPT = `
你是加密貨幣優惠與空投資訊解析專家。請從以下文本中提取結構化數據，用於建立「福利中心」的活動卡片。

【解析規則】
1. 自動判別活動標題、獎勵價值、來源、截止時間。
2. 時間格式轉換為 ISO 8601 (YYYY-MM-DDTHH:mm:ss)，預設時區 Asia/Taipei。
3. 如果是長期活動（無明確結束時間），標記 is_ongoing: true。
4. 自動生成 slug（英文小寫+連字號）。
5. 自動判斷類型 (reward_type) 與 來源 (source)。
6. 難度判斷：
   - easy: 註冊、關注、填表
   - medium: 需 KYC、入金、輕度交互
   - hard: 需高額交易、複雜交互、質押鎖倉

【類型映射】
- exchange_promo: 交易所活動、交易競賽、入金獎勵
- raffle: 抽獎、Giveaway、白名單抽籤
- airdrop: 空投、免費領幣、測試網交互
- learn_earn: 學習賺幣、答題獎勵
- referral: 推薦碼、返佣
- other: 其他

【來源映射】
- exchange: 幣安, MAX, Bybit, OKX 等中心化交易所
- project: DeFi 協議, NFT 項目, L2 公鏈等
- cryptotw: CryptoTW 自家活動
- other: 其他

【輸出格式】只輸出 JSON
{
  "title": "活動標題 (簡短有力)",
  "slug": "event-slug-2024",
  "description": "活動簡介（Markdown，提取重點條件與獎勵）",
  "reward_type": "exchange_promo|raffle|airdrop|learn_earn|referral|other",
  
  "source": "cryptotw|exchange|project|other",
  "source_name": "來源名稱 (如 MAX, Binance, Starknet)",
  
  "start_date": "2024-12-28T14:00:00",
  "end_date": "2024-12-31T23:59:59",
  "is_ongoing": false,
  
  "reward_value": "獎勵價值 (如: 100 USDT, 20 ETH)",
  "requirements": "參與門檻 (如: 完成 KYC2, 交易量 > 1000U)",
  "difficulty": "easy|medium|hard",
  
  "action_url": "活動連結 (如有)",
  "action_label": "按鈕文字 (如: 立即參加, 前往註冊)",
  
  "tags": ["標籤1", "標籤2"]
}

【注意事項】
- 若資訊不完整，對應欄位設為 null 或合理預設值
- 盡量提取 action_url，若無則留空
- reward_value 請盡量量化，若無法量化則填寫主要獎品名稱

【原始資訊】
`;

interface ImportedReward {
    title: string;
    slug: string;
    description?: string;
    reward_type: string;
    source: string;
    source_name: string;
    start_date: string;
    end_date?: string;
    is_ongoing: boolean;
    reward_value?: string;
    requirements?: string;
    difficulty: string;
    action_url: string;
    action_label: string;
    tags?: string[];
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { raw_content } = body;

        if (!raw_content) {
            return NextResponse.json({ error: 'Missing raw_content' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: IMPORT_MODEL });

        const prompt = IMPORT_PROMPT + raw_content;

        logger.info('Starting AI reward import', {
            feature: 'rewards-import',
            content_length: raw_content.length
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            logger.error('Failed to parse AI response', { feature: 'rewards-import' });
            return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
        }

        const importedData: ImportedReward = JSON.parse(jsonMatch[1] || jsonMatch[0]);

        // Defaults
        const rewardData = {
            ...importedData,
            slug: importedData.slug || importedData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Date.now().toString(36),
            start_date: importedData.start_date || new Date().toISOString(),
            is_ongoing: importedData.is_ongoing ?? false,
            difficulty: importedData.difficulty || 'easy',
            action_label: importedData.action_label || '立即參加',
            source_name: importedData.source_name || 'CryptoTW',
            action_url: importedData.action_url || '',
            is_published: false,
            is_featured: false
        };

        return NextResponse.json({
            success: true,
            reward: rewardData
        });

    } catch (error) {
        logger.error('Error in AI reward import', error, { feature: 'rewards-import' });
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}
