'use server'

import { HomeRouterService } from '@/lib/services/home-router'

export async function getHomeRouterAction() {
    try {
        const data = await HomeRouterService.getRouterData()
        return { success: true, data }
    } catch (error) {
        return { success: false, error: 'Failed to fetch home router data' }
    }
}
