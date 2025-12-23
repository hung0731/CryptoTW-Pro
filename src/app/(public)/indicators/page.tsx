import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { IndicatorsListService } from '@/lib/services/indicators-list';
import IndicatorsPageClient from '@/components/indicators/IndicatorsPageClient';
import { headers } from 'next/headers';

export const revalidate = 60; // ISR for 60 seconds

export default async function IndicatorsPage() {
    // Get host for absolute URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const viewModel = await IndicatorsListService.getPageViewModel(baseUrl);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="市場指標"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />
            <IndicatorsPageClient viewModel={viewModel} />
        </main>
    );
}
