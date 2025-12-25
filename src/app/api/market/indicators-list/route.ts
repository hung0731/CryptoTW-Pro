import { NextResponse } from 'next/server';
import { IndicatorsListService } from '@/lib/services/indicators-list';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const headersList = await headers();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const viewModel = await IndicatorsListService.getPageViewModel(baseUrl);

        return NextResponse.json(viewModel);
    } catch (error) {
        console.error('Error fetching indicators list:', error);
        return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
    }
}
