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
        console.error('Error fetching API usage stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch API usage stats' },
            { status: 500 }
        );
    }
}
