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
    emoji?: string
    metrics?: {
        whale_ratio?: number
        global_ratio?: number
    }
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
4. **Emoji**: Select ONE single emoji that best represents the current market vibe. Be creative and diverse (e.g., 🎢, 🩸, 🌱, 🧊, 🌋, 🐢, 🚀, 💀, 🧘, 🌪️). Avoid just using 📈/📉 repeatedly.
5. **Content**:
    - Sentiment Score (0-100, <30 Bearish, >70 Bullish)
    - Short Summary (3-4 lines, summarize the WHOLE market state).
    - Key Points (3 bullet points of what matters NOW).
    - Actionable Insight (One conservative piece of advice).
    - Risk Level (Low/Medium/High/Extreme).
    - Emoji (The selected emoji character).

    **Data Focus**:
    - Compare "Global Long/Short" (Retail) vs "Whale Ratio" (Top Accounts).
    - If Whales are Longing (>1.1) but Sentimental is Fear -> Bullish Signal.
    - If Whales are Shorting (<0.9) but Retail is Longing -> Bearish Divergence.

Output JSON Schema:
{
  "sentiment_score": number,
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "summary": "string"
}
`

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Extract JSON from markdown code block if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)

        if (jsonMatch) {
            const jsonStr = jsonMatch[1]
            return JSON.parse(jsonStr)
        }

        return JSON.parse(text)

    } catch (e) {
        console.error('Gemini Generation Error:', e)
        return null
    }
}
