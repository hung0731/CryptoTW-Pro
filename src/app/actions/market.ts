'use server'

import { MarketStatusService } from '@/lib/services/market-status'
import { unstable_cache } from 'next/cache'

// Cache the service call
const getCachedStatus = unstable_cache(
    async () => {
        return await MarketStatusService.getMarketStatus()
    },
    ['market-status-service'],
    { revalidate: 60 }
)

export async function getMarketStatusAction() {
    return await getCachedStatus()
}
