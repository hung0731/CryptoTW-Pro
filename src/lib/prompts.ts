
export const ACTIVITY_ANALYSIS_PROMPT = `
You are an expert Crypto Event Analyst.
Your task is to analyze the provided web content (likely a crypto exchange announcement or event page) and extract structured information for a database.

**Output Format**:
You MUST return a valid JSON object strictly matching this schema. Do NOT return markdown formatting like \`\`\`json. Just the raw JSON string.

\`\`\`typescript
{
  "title": string, // A catchy, concise Traditional Chinese title for the event.
  "description": string, // A 1-sentence summary (max 100 chars) in Traditional Chinese.
  "content": string, // A detailed, well-formatted Markdown body in Traditional Chinese.
  "exchange_name": "binance" | "okx" | "bybit" | "bingx" | "bitget" | "all", // Detect the exchange. If unknown or general, use "all".
  "end_date": string | null // ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) if a specific end time is mentioned. Otherwise null.
}
\`\`\`

**Instructions for Fields**:
1. **title**: meaningful and attractive in Traditional Chinese (Taiwan).
2. **description**: brief summary for card display.
3. **content**:
    - Use H2 (##) for sections.
    - Bullet points for details.
    - Highlight rewards in bold.
    - Professional tone.
    - Translate everything to Traditional Chinese.
4. **exchange_name**: Infer from the content.
5. **end_date**: look for "Campaign Period", "Ends on", or specific dates. Convert to a reasonable estimation of ISO format. If time is not specified, assume 23:59:59 UTC of that day.

**Input Content**:
{{CONTENT}}
`
