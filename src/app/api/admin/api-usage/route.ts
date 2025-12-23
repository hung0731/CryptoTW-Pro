import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server';
import { getApiUsageStats } from '@/lib/api-usage';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stats = getApiUsageStats();

        return NextResponse.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error('Error fetching API usage stats', error, { feature: 'admin-api', endpoint: 'api-usage' });
        return NextResponse.json(
            { success: false, error: 'Failed to fetch API usage stats' },
            { status: 500 }
        );
    }
}
