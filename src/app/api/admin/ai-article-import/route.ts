import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { INTERNATIONAL_ARTICLE_PROMPT } from '@/lib/prompts'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const maxDuration = 60

export async function POST(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { url } = await req.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const firecrawlKey = process.env.FIRECRAWL_API_KEY
        const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

        if (!firecrawlKey || !geminiKey) {
            return NextResponse.json({ error: 'Server configuration error: Missing API Keys' }, { status: 500 })
        }

        // 1. Scrape with Firecrawl
        console.log('Scraping URL:', url)
        const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firecrawlKey}`
            },
            body: JSON.stringify({
                url,
                formats: ['markdown'],
                onlyMainContent: true
            })
        })

        if (!scrapeRes.ok) {
            const err = await scrapeRes.text()
            console.error('Firecrawl Error:', err)
            return NextResponse.json({ error: 'Failed to scrape URL. Firecrawl Error.' }, { status: 500 })
        }

        const scrapeData = await scrapeRes.json()
        const content = scrapeData.data?.markdown

        if (!content) {
            return NextResponse.json({ error: 'No content found' }, { status: 400 })
        }

        // 2. Process with Gemini
        console.log('Processing with Gemini...')
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025",
            generationConfig: {
                responseMimeType: "application/json"
            }
        })

        // Inject variables into prompt
        const prompt = INTERNATIONAL_ARTICLE_PROMPT
            .replace('{{CONTENT}}', content.substring(0, 40000)) // Limit length for token context
            .replace('{{URL}}', url)
            .replace('{{URL}}', url) // Replace second occurrence if any

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log('Gemini Response:', text)

        let parsedData
        try {
            parsedData = JSON.parse(text)
        } catch (e) {
            console.error('Failed to parse JSON:', e)
            return NextResponse.json({ error: 'AI returned invalid JSON format' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: {
                ...parsedData,
                original_url: url
            }
        })

    } catch (e: any) {
        console.error('AI Article Import Error:', e)
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
    }
}
