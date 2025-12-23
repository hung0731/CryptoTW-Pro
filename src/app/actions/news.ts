'use server'

import { NewsService } from '@/lib/services/news'

export async function getMarketContextAction() {
    try {
        const context = await NewsService.getMarketContext()
        return { success: true, data: context }
    } catch (error) {
        return { success: false, error: 'Failed to fetch market context' }
    }
}
