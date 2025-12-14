import { NextResponse } from 'next/server'
import { NewsFlashItem, getCoinglassApiKey } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 min

export async function GET() {
    try {
        const apiKey = getCoinglassApiKey()
        
        if (!apiKey) {
            console.error('COINGLASS_API_KEY not configured')
            throw new Error('API Key missing')
        }

        const url = 'https://open-api-v4.coinglass.com/api/newsflash/list'
        const options = {
            method: 'GET',
            headers: { 'CG-API-KEY': apiKey }
        }

        const response = await fetch(url, options)
        
        if (!response.ok) {
            console.error('Coinglass News API error:', response.status, response.statusText)
            throw new Error(`API returned ${response.status}`)
        }
        
        const json = await response.json()
        
        // V4 API returns { code: '0', data: [...] }
        if (json.code !== '0' || !Array.isArray(json.data)) {
            console.warn('Coinglass News API returned error:', json.msg)
            throw new Error(json.msg || 'Invalid response')
        }
        
        const news: NewsFlashItem[] = json.data

        return NextResponse.json({ news })

    } catch (error) {
        console.error('News API Error:', error)
        
        // Fallback mock data
        const now = Date.now()
        const mockNews: NewsFlashItem[] = [
            {
                id: 'notification-key',
                title: '系統提示：新聞載入失敗',
                content: 'Coinglass 快訊 API 暫時無法連線。請確認 API Key 是否有效，或稍後重新整理頁面。',
                url: '#',
                source: 'System',
                createTime: now,
                highlight: true
            }
        ]
        return NextResponse.json({ news: mockNews })
    }
}
