import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic' // Ensure we get fresh data
export const revalidate = 1800 // Cache for 30 minutes

// PANews RSS Feed
const RSS_URL = 'https://www.panewslab.com/zh/rss/newsflash.xml'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

const PROMPT_TEMPLATE = `
你是一個加密市場研究助理。
你的任務不是重寫新聞，而是將多則新聞內容「抽象化」為市場關注的主題與脈絡。

請遵守以下規則：
1. 不得出現任何新聞來源名稱、媒體名稱或作者
2. 不得重述事件細節、數字、人名、專案名稱
3. 不得使用「據報導」、「某媒體指出」等語句
4. 不得評論價格漲跌或給出投資建議
5. 使用中性、研究導向的語氣
6. 將內容整理為「市場正在關注的事項」，而非「發生了什麼新聞」
7. 必須使用**繁體中文 (台灣)**回答。

以下是過去 24 小時的市場新聞標題集合：
{TITLES}

請根據以上標題，輸出一個 JSON 格式的回應，格式如下：
{
  "summary": "一段總結（1–2 句），概括市場目前的整體關注焦點。",
  "highlights": [
    {
      "theme": "關注事項主題（例如：宏觀政策相關討論持續發酵）",
      "impact": "影響層面（例如：利率預期、風險資產情緒）"
    },
    ...（最少 2 個，最多 4 個重點）
  ]
}
`

export async function GET() {
    try {
        console.log('Fetching RSS from:', RSS_URL)
        const rssRes = await fetch(RSS_URL, { next: { revalidate: 1800 } })
        if (!rssRes.ok) {
            throw new Error(`Failed to fetch RSS: ${rssRes.status}`)
        }
        const xmlText = await rssRes.text()

        // Simple Regex to extract titles to avoid heavy xml parsers
        // Matches <title>...</title> inside <item> ideally, but global generic match is fine for context
        // We limit to top 50 to fit in context window and stay relevant
        const titleMatches = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || []

        const titles = titleMatches
            .map(t => t.replace(/<title><!\[CDATA\[|\]\]><\/title>/g, ''))
            .filter(t => t && !t.includes('PANews')) // Filter out site meta titles if any
            .slice(0, 50)
            .join('\n')

        if (!titles) {
            return NextResponse.json({
                summary: "目前市場資訊暫時無法取得，請稍後再試。",
                highlights: []
            })
        }

        // Call Gemini
        const prompt = PROMPT_TEMPLATE.replace('{TITLES}', titles)
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Parse JSON from Gemini response (handle potential markdown blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.error("Gemini did not return valid JSON:", responseText)
            throw new Error("Invalid AI response format")
        }

        const data = JSON.parse(jsonMatch[0])

        return NextResponse.json(data)

    } catch (error) {
        console.error('Market Context API Error:', error)
        // Fallback data structure
        return NextResponse.json({
            summary: "目前無法取得市場脈絡分析，系統正在重試中。",
            highlights: []
        }, { status: 500 })
    }
}
