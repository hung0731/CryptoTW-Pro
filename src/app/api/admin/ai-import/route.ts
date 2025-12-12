import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { INTERNATIONAL_ARTICLE_PROMPT } from '@/lib/prompts'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

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
            return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 })
        }

        const scrapeData = await scrapeRes.json()
        const content = scrapeData.data?.markdown

        if (!content) {
            return NextResponse.json({ error: 'No content found' }, { status: 400 })
        }

        // 2. Process with Gemini
        console.log('Processing with Gemini...')
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" })

        // Inject variables into prompt (simple replacement)
        const prompt = INTERNATIONAL_ARTICLE_PROMPT
            .replace('{{CONTENT}}', content.substring(0, 30000)) // Limit length to avoid token limits if super long
            .replace('{{URL}}', url)

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // 3. Parse Title and Body
        // Expecting the AI to return a title in the first line "# Title" or similar, but let's just take the raw markdown.
        // Ideally we ask AI to output JSON, but for Markdown Editor, raw markdown is fine.
        // We might want to extract H1 as title.

        let title = 'New International Article'
        let body = text

        const h1Match = text.match(/^#\s+(.+)$/m)
        if (h1Match) {
            title = h1Match[1].trim()
            // Optionally remove H1 from body if it's redundant, but usually fine to keep or let user edit.
        }

        return NextResponse.json({
            success: true,
            data: {
                title,
                body,
                originalUrl: url
            }
        })

    } catch (e: any) {
        console.error('AI Import Error:', e)
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
    }
}
