import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const IMPORT_MODEL = 'gemini-2.5-flash-preview-05-20';

const IMPORT_PROMPT = `
你是活動資訊解析專家。請從以下活動資訊中提取結構化數據。

【解析規則】
1. 自動判別活動名稱、時間、地點、主辦方等資訊
2. 時間格式轉換為 ISO 8601 (YYYY-MM-DDTHH:mm:ss)，預設時區 Asia/Taipei
3. 如果只有日期沒有時間，預設為 14:00
4. 如果有議程表，提取為 schedule 陣列
5. 自動判斷活動類型：conference / meetup / workshop / hackathon / online
6. 自動生成 slug（英文小寫+連字號）

【活動類型判斷】
- conference: 多日、多講者、有議程
- meetup: 單日社群聚會、交流活動
- workshop: 實作工作坊、教學課程
- hackathon: 黑客松、開發競賽
- online: 線上活動、Webinar

【輸出格式】只輸出 JSON
{
  "title": "活動名稱",
  "slug": "event-slug-2024",
  "description": "活動說明（Markdown 格式）",
  "event_type": "conference|meetup|workshop|hackathon|online",
  
  "start_date": "2024-12-28T14:00:00",
  "end_date": "2024-12-28T18:00:00",
  "timezone": "Asia/Taipei",
  
  "location_type": "physical|online|hybrid",
  "venue_name": "場地名稱",
  "address": "完整地址",
  "city": "城市",
  "online_url": "線上連結（如有）",
  
  "registration_url": "報名連結",
  "is_free": true,
  "price_info": "價格資訊（如有）",
  
  "organizer_name": "主辦方",
  "co_organizers": [{"name": "協辦單位"}],
  
  "tags": ["標籤1", "標籤2"],
  
  "schedule": [
    {
      "time": "14:00-14:30",
      "title": "議程名稱",
      "description": "議程說明",
      "speaker": "講者名稱",
      "location": "場地",
      "type": "talk|workshop|break|networking|other"
    }
  ]
}

【注意事項】
- 如果沒有議程資訊，schedule 為空陣列 []
- 如果資訊不完整，對應欄位設為 null
- 台灣城市正確寫法：台北、新竹、台中、高雄
- 盡量從文字中推斷缺失資訊

【原始活動資訊】
`;

interface TimelineItem {
    time: string;
    title: string;
    description?: string;
    speaker?: string;
    location?: string;
    type?: 'talk' | 'break' | 'networking' | 'workshop' | 'other';
}

interface ImportedEvent {
    title: string;
    slug: string;
    description?: string;
    event_type: string;
    start_date: string;
    end_date?: string;
    timezone: string;
    location_type: string;
    venue_name?: string;
    address?: string;
    city?: string;
    online_url?: string;
    registration_url?: string;
    is_free: boolean;
    price_info?: string;
    organizer_name: string;
    co_organizers?: { name: string }[];
    tags?: string[];
    schedule?: TimelineItem[];
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

        logger.info('Starting AI event import', {
            feature: 'events-import',
            content_length: raw_content.length
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON from response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            logger.error('Failed to parse AI response', { feature: 'events-import' });
            return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
        }

        const importedData: ImportedEvent = JSON.parse(jsonMatch[1] || jsonMatch[0]);

        // Validate required fields
        if (!importedData.title || !importedData.start_date) {
            return NextResponse.json({
                error: 'AI could not extract required fields (title, start_date)',
                partial: importedData
            }, { status: 400 });
        }

        // Ensure defaults
        const eventData = {
            ...importedData,
            slug: importedData.slug || importedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Date.now().toString(36),
            timezone: importedData.timezone || 'Asia/Taipei',
            event_type: importedData.event_type || 'meetup',
            location_type: importedData.location_type || 'physical',
            is_free: importedData.is_free ?? true,
            organizer_name: importedData.organizer_name || '待補充',
            co_organizers: importedData.co_organizers || [],
            tags: importedData.tags || [],
            schedule: importedData.schedule || [],
            is_published: false,
            is_featured: false
        };

        logger.info('AI event import completed', {
            feature: 'events-import',
            title: eventData.title,
            has_schedule: eventData.schedule.length > 0
        });

        return NextResponse.json({
            success: true,
            event: eventData
        });

    } catch (error) {
        logger.error('Error in AI event import', error, { feature: 'events-import' });
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}
