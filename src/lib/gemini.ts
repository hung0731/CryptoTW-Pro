import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Specific model version requested by user
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'

export interface MarketSummaryResult {
    sentiment_score: number
    sentiment: string
    summary: string
    key_points: string[]
    actionable_insight: string
    risk_level: string
}

export async function generateMarketSummary(marketData: any): Promise<MarketSummaryResult | null> {
    if (!genAI) {
        console.error('Gemini API Key is missing')
        return null
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
Role: Senior Crypto Market Analyst (Conservative & Data-Driven).
Task: Analyze the provided market data and generate a "Market Pulse" summary (懶人包) for a professional audience in Taiwan.

Data Snapshot:
${JSON.stringify(marketData, null, 2)}

Requirements:
1. **Conservatism**: When giving advice, be extremely conservative. Emphasize risk management. Avoid "moon boy" predictions.
2. **Language**: Traditional Chinese (Taiwanese crypto terminology).
3. **Format**: Returns strictly valid JSON.
4. **Content**:
    - Sentiment Score (0-100, <30 Bearish, >70 Bullish)
    - Short Summary (3-4 lines, summarize the WHOLE market state).
    - Key Points (3 bullet points of what matters NOW).
    - Actionable Insight (One conservative piece of advice).
    - Risk Level (Low/Medium/High/Extreme).

Output JSON Schema:
{
  "sentiment_score": number,
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "summary": "string",
  "key_points": ["string", "string", "string"],
  "actionable_insight": "string",
  "risk_level": "string"
}
`

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Extract JSON from markdown code block if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0]
            return JSON.parse(jsonStr)
        }

        return JSON.parse(text)

    } catch (e) {
        console.error('Gemini Generation Error:', e)
        return null
    }
}
